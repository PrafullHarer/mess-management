const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { getAllStudents, createUser, updateUser, deleteUser, findUserByMobile, findUserById } = require('../models/userModel');
const { Holiday } = require('../models/holidayModel');
const {
    PLAN_OPTIONS, planToMealSlot, totalMeals,
    isTwoTime, isEvening, isAfternoon, planDuration,
    studentStatus, remainingMeals, messEndDate,
    simulatePlan, safeInt, isUnusualPlan, fmtDate
} = require('../utils/calculations');

const getStudents = asyncHandler(async (req, res) => {
    const students = await getAllStudents(req.user.messId);

    // Fetch holidays for this mess for status computation
    const holQuery = {};
    if (req.user.messId) holQuery.messId = req.user.messId;
    const holidays = await Holiday.find(holQuery);
    const holsFormatted = holidays.map(h => ({
        date: h.dateStr,
        slot: h.slot || 'Whole Day',
        reason: h.reason || h.name || ''
    }));

    // Compute status and remaining meals for each student
    const enriched = students.map(s => {
        const sObj = s.toObject();
        const st = studentStatus(sObj, holsFormatted);
        const rem = remainingMeals(sObj, holsFormatted);
        const endDate = messEndDate(sObj, holsFormatted);
        const sim = simulatePlan(sObj, holsFormatted);
        const totalHols = sim.personalHols;
        const tm = totalMeals(sObj.plan);
        const consumedMeals = tm - rem;

        return {
            ...sObj,
            computedStatus: st,
            remainingMeals: rem,
            messEndDate: fmtDate(endDate),
            messEndDateISO: endDate instanceof Date ? endDate.toISOString().split('T')[0] : '',
            totalHolidays: totalHols,
            totalMeals: tm,
            consumedMeals,
            pending: safeInt(sObj.amount) - safeInt(sObj.paid)
        };
    });

    res.json(enriched);
});

const addStudent = asyncHandler(async (req, res) => {
    const {
        name, mobile, password,
        plan, amount, paid, diet,
        studentHolidays, paymentNotes, gender,
        joined_at, meal_slot  // Legacy fields still accepted
    } = req.body;

    // Validate mandatory fields
    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Student name is required');
    }
    if (!mobile || mobile.replace(/\D/g, '').length !== 10) {
        res.status(400);
        throw new Error('Valid 10-digit mobile number is required');
    }
    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }

    const joiningDate = joined_at || req.body.joiningDate;
    if (!joiningDate) {
        res.status(400);
        throw new Error('Joining date is required');
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(joiningDate)) {
        res.status(400);
        throw new Error('Joining date must be in YYYY-MM-DD format');
    }

    if (await findUserByMobile(mobile.replace(/\D/g, ''))) {
        res.status(400);
        throw new Error('Student with this mobile already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine plan — use new plan field or derive from legacy meal_slot
    const studentPlan = plan || (meal_slot === 'BOTH' ? '2 Time' : meal_slot === 'NIGHT' ? '1 Time Eve' : '1 Time Aftr');
    const mealSlot = planToMealSlot(studentPlan);
    const mealsPerDay = isTwoTime(studentPlan) ? 2 : 1;

    const student = await createUser({
        name: name.trim(),
        mobile: mobile.replace(/\D/g, ''),
        passwordHash: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        messId: req.user.messId, // Scope to the owner's mess
        plan: studentPlan,
        amount: safeInt(amount),
        paid: safeInt(paid),
        diet: diet || 'Veg',
        studentHolidays: Array.isArray(studentHolidays) ? studentHolidays : [],
        paymentNotes: paymentNotes || '',
        gender: gender || 'boys',
        // Legacy fields (auto-derived)
        monthlyFee: safeInt(amount),
        paymentMode: 'PREPAID',
        dailyRate: 0,
        messType: mealSlot === 'BOTH' ? 'FULL' : 'SINGLE',
        mealSlot,
        joinedAt: joiningDate,
        joiningDate,
        mealsPerDay,
        advanceBalance: 0
    });

    res.status(201).json(student);
});

const editStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        name, mobile, status,
        plan, amount, paid, diet,
        studentHolidays, paymentNotes, gender,
        meal_slot, joined_at, password
    } = req.body;

    const existingUser = await findUserById(id);
    if (!existingUser) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Determine plan
    const studentPlan = plan || existingUser.plan || (meal_slot ? (meal_slot === 'BOTH' ? '2 Time' : meal_slot === 'NIGHT' ? '1 Time Eve' : '1 Time Aftr') : existingUser.plan);
    const mealSlot = planToMealSlot(studentPlan);
    const mealsPerDay = isTwoTime(studentPlan) ? 2 : 1;

    const joinDate = joined_at || req.body.joiningDate || existingUser.joinedAt;

    let updateData = {
        name: name?.trim() || existingUser.name,
        mobile: mobile ? mobile.replace(/\D/g, '') : existingUser.mobile,
        status: status || existingUser.status,
        plan: studentPlan,
        amount: amount !== undefined ? safeInt(amount) : existingUser.amount,
        paid: paid !== undefined ? safeInt(paid) : existingUser.paid,
        diet: diet || existingUser.diet,
        studentHolidays: studentHolidays !== undefined ? (Array.isArray(studentHolidays) ? studentHolidays : []) : existingUser.studentHolidays,
        paymentNotes: paymentNotes !== undefined ? paymentNotes : existingUser.paymentNotes,
        gender: gender || existingUser.gender,
        // Legacy fields
        monthlyFee: amount !== undefined ? safeInt(amount) : existingUser.monthlyFee,
        messType: mealSlot === 'BOTH' ? 'FULL' : 'SINGLE',
        mealSlot,
        joinedAt: joinDate,
        mealsPerDay,
        dailyRate: 0
    };

    if (password && password.trim()) {
        const salt = await bcrypt.genSalt(10);
        updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updated = await updateUser(id, updateData);
    res.json(updated);
});

const removeStudent = asyncHandler(async (req, res) => {
    await deleteUser(req.params.id);
    res.json({ message: 'Student removed' });
});

module.exports = { getStudents, addStudent, editStudent, removeStudent, PLAN_OPTIONS };