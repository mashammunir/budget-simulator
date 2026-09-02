let userAnswers = {};

const landingScreen = document.getElementById('landingScreen');
const q1Screen = document.getElementById('q1Screen');
const q2Screen = document.getElementById('q2Screen');
const q3Screen = document.getElementById('q3Screen');
const q4Screen = document.getElementById('q4Screen');
const q5Screen = document.getElementById('q5Screen');
const q6Screen = document.getElementById('q6Screen');
const q7Screen = document.getElementById('q7Screen');
const snapshotScreen = document.getElementById('snapshotScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const affordScreen = document.getElementById('affordScreen');
const targetScreen = document.getElementById('targetScreen');
const goalScreen = document.getElementById('goalScreen');
const challengesScreen = document.getElementById('challengesScreen');
const historyScreen = document.getElementById('historyScreen');
const editChoiceScreen = document.getElementById('editChoiceScreen');
const editPickScreen = document.getElementById('editPickScreen');

const allScreens = [q1Screen, q2Screen, q3Screen, q4Screen, q5Screen, q6Screen, q7Screen];

function goTo(fromScreen, toScreen) {
  fromScreen.classList.add('hidden');
  toScreen.classList.remove('hidden');
}

function hideAllExcept(screen) {
  [landingScreen, q1Screen, q2Screen, q3Screen, q4Screen, q5Screen, q6Screen, q7Screen,
   snapshotScreen, dashboardScreen, affordScreen, targetScreen, goalScreen, challengesScreen,
   historyScreen, editChoiceScreen, editPickScreen].forEach(function(s) {
    if (s !== screen) s.classList.add('hidden');
  });
  screen.classList.remove('hidden');
}

function saveAnswers() {
  localStorage.setItem('soojhData', JSON.stringify(userAnswers));
}

function migrateOldDataIfNeeded(data) {
  if (data.bills === undefined || data.ongoingExpenses === undefined) {
    data.bills = data.bills || [];
    data.ongoingExpenses = data.ongoingExpenses !== undefined
      ? data.ongoingExpenses
      : (data.plannedExpenses || 0);
    data._needsMigrationNotice = true;
  }
  if (data.completedChallenges === undefined) {
    data.completedChallenges = [];
  }
  // Migrate old single activeChallenge into the new array format
  if (data.activeChallenge !== undefined) {
    if (data.activeChallenges === undefined) {
      data.activeChallenges = data.activeChallenge ? [data.activeChallenge] : [];
    }
    delete data.activeChallenge;
  }
  if (data.activeChallenges === undefined) {
    data.activeChallenges = [];
  }
  if (data.cycleHistory === undefined) {
    data.cycleHistory = [];
  }
  return data;
}

function loadAnswers() {
  const saved = localStorage.getItem('soojhData');
  if (!saved) return null;
  return migrateOldDataIfNeeded(JSON.parse(saved));
}

window.addEventListener('DOMContentLoaded', function() {
  const saved = loadAnswers();
  if (saved && saved.currentMoney !== undefined) {
    userAnswers = saved;
    userAnswers.daysLeft = calculateDaysLeft();
    hideAllExcept(dashboardScreen);
    showDashboard();
  }
  updateEditBackLinks();
});

document.getElementById('startBtn').addEventListener('click', function() {
  goTo(landingScreen, q1Screen);
});

document.querySelectorAll('#q1Screen .option-card').forEach(function(button) {
  button.addEventListener('click', function() {
    userAnswers.livingSituation = button.getAttribute('data-value');
    if (userAnswers._editMode) {
      returnToDashboardFromEdit();
    } else {
      goTo(q1Screen, q2Screen);
    }
  });
});

document.querySelectorAll('#q2Screen .option-card').forEach(function(button) {
  button.addEventListener('click', function() {
    userAnswers.incomeSource = button.getAttribute('data-value');
    if (userAnswers._editMode) {
      returnToDashboardFromEdit();
    } else {
      goTo(q2Screen, q3Screen);
    }
  });
});

document.getElementById('q3ContinueBtn').addEventListener('click', function() {
  const value = document.getElementById('currentMoneyInput').value;
  if (!value || Number(value) < 0) {
    alert('Enter how much money you actually have.');
    return;
  }
  userAnswers.currentMoney = Number(value);
  if (userAnswers._editMode) {
    returnToDashboardFromEdit();
  } else {
    goTo(q3Screen, q4Screen);
  }
});

document.getElementById('q4ContinueBtn').addEventListener('click', function() {
  const value = document.getElementById('nextIncomeDateInput').value;
  if (!value) {
    alert('Pick a date, or tell us you do not know it.');
    return;
  }
  userAnswers.nextIncomeDate = value;
  userAnswers.usesFallbackDays = false;
  if (userAnswers._editMode) {
    returnToDashboardFromEdit();
  } else {
    goTo(q4Screen, q5Screen);
  }
});

document.getElementById('dontKnowDateBtn').addEventListener('click', function() {
  document.getElementById('fallbackDaysBox').classList.remove('hidden');
});

document.getElementById('fallbackContinueBtn').addEventListener('click', function() {
  const days = document.getElementById('fallbackDaysInput').value;
  if (!days || Number(days) <= 0) {
    alert('Enter how many days we should plan for.');
    return;
  }
  userAnswers.fallbackDays = Number(days);
  userAnswers.usesFallbackDays = true;
  if (userAnswers._editMode) {
    returnToDashboardFromEdit();
  } else {
    goTo(q4Screen, q5Screen);
  }
});

document.getElementById('q5ContinueBtn').addEventListener('click', function() {
  const value = document.getElementById('nextIncomeAmountInput').value;
  if (!value || Number(value) < 0) {
    alert('Enter how much you expect to receive.');
    return;
  }
  userAnswers.nextIncomeAmount = Number(value);
  if (userAnswers._editMode) {
    returnToDashboardFromEdit();
  } else {
    goTo(q5Screen, q6Screen);
  }
});

const q6QuickView = document.getElementById('q6QuickView');
const q6DetailedHostel = document.getElementById('q6DetailedHostel');
const q6DetailedDay = document.getElementById('q6DetailedDay');

document.getElementById('breakDownBtn').addEventListener('click', function() {
  q6QuickView.classList.add('hidden');
  if (userAnswers.livingSituation === 'hostel') {
    q6DetailedHostel.classList.remove('hidden');
  } else {
    q6DetailedDay.classList.remove('hidden');
  }
});

document.getElementById('backToQuickFromHostel').addEventListener('click', function() {
  q6DetailedHostel.classList.add('hidden');
  q6QuickView.classList.remove('hidden');
});

document.getElementById('backToQuickFromDay').addEventListener('click', function() {
  q6DetailedDay.classList.add('hidden');
  q6QuickView.classList.remove('hidden');
});

document.getElementById('q6ContinueBtn').addEventListener('click', function() {
  const value = document.getElementById('expensesInput').value;
  if (!value || Number(value) < 0) {
    alert('Enter your planned expenses. Even a rough number works.');
    return;
  }
  userAnswers.plannedExpenses = Number(value);
  userAnswers.ongoingExpenses = Number(value);
  userAnswers.bills = [];
  userAnswers.expenseBreakdown = null;
  userAnswers._needsMigrationNotice = false;
  goToAfterQ6();
});

document.getElementById('q6HostelContinueBtn').addEventListener('click', function() {
  const hostelFee = Number(document.getElementById('hostelFeeInput').value) || 0;
  const hostelFeeFrequency = document.getElementById('hostelFeeFrequency').value;
  const hostelFeeDueNow = document.getElementById('hostelFeeDueNow').checked;

  const messFee = Number(document.getElementById('messFeeInput').value) || 0;
  const food = Number(document.getElementById('hostelFoodInput').value) || 0;
  const transport = Number(document.getElementById('hostelTransportInput').value) || 0;

  const homeTrip = Number(document.getElementById('hostelHomeTripInput').value) || 0;
  const homeTripFrequency = document.getElementById('hostelHomeTripFrequency').value;
  const homeTripDueNow = document.getElementById('hostelHomeTripDueNow').checked;

  const stationery = Number(document.getElementById('hostelStationeryInput').value) || 0;

  const other = Number(document.getElementById('hostelOtherInput').value) || 0;
  const otherFrequency = document.getElementById('hostelOtherFrequency').value;
  const otherDueNow = document.getElementById('hostelOtherDueNow').checked;

  const ongoingExpenses = food + transport + stationery;
  const bills = [];

  if (messFee > 0) {
    bills.push({ id: 'messFee', label: 'Mess fee', amount: messFee, frequency: 'monthly', dueNow: true, paid: false });
  }
  if (hostelFee > 0) {
    bills.push({ id: 'hostelFee', label: 'Hostel fee', amount: hostelFee, frequency: hostelFeeFrequency, dueNow: hostelFeeDueNow, paid: false });
  }
  if (homeTrip > 0) {
    bills.push({ id: 'homeTrip', label: 'Trips back home', amount: homeTrip, frequency: homeTripFrequency, dueNow: homeTripDueNow, paid: false });
  }
  if (other > 0) {
    bills.push({ id: 'hostelOther', label: 'Everything else', amount: other, frequency: otherFrequency, dueNow: otherDueNow, paid: false });
  }

  const billsDueTotal = bills.reduce(function(sum, b) { return sum + (b.dueNow ? b.amount : 0); }, 0);
  const total = ongoingExpenses + billsDueTotal;

  if (total <= 0 && bills.length === 0) {
    alert('Enter at least one expense.');
    return;
  }

  userAnswers.plannedExpenses = total;
  userAnswers.ongoingExpenses = ongoingExpenses;
  userAnswers.bills = bills;
  userAnswers._needsMigrationNotice = false;
  userAnswers.expenseBreakdown = [
    { label: 'Hostel fee', amount: hostelFee },
    { label: 'Mess fee', amount: messFee },
    { label: 'Food / snacks', amount: food },
    { label: 'Local transport', amount: transport },
    { label: 'Trips back home', amount: homeTrip },
    { label: 'Stationery / printing', amount: stationery },
    { label: 'Everything else', amount: other }
  ].filter(function(row) { return row.amount > 0; });

  goToAfterQ6();
});

document.getElementById('q6DayContinueBtn').addEventListener('click', function() {
  const mode = document.getElementById('transportModeSelect').value;
  const farePerDay = Number(document.getElementById('transportFareInput').value) || 0;
  const daysPerWeek = Number(document.getElementById('transportDaysInput').value) || 0;
  const foodPerDay = Number(document.getElementById('dayFoodInput').value) || 0;
  const stationery = Number(document.getElementById('dayStationeryInput').value) || 0;

  const other = Number(document.getElementById('dayOtherInput').value) || 0;
  const otherFrequency = document.getElementById('dayOtherFrequency').value;
  const otherDueNow = document.getElementById('dayOtherDueNow').checked;

  const daysLeftEstimate = userAnswers.usesFallbackDays
    ? userAnswers.fallbackDays
    : Math.max(1, Math.ceil((new Date(userAnswers.nextIncomeDate) - new Date()) / (1000 * 60 * 60 * 24)));

  const weeksInPeriod = daysLeftEstimate / 7;
  const totalTransport = mode === 'walk' ? 0 : Math.round(farePerDay * daysPerWeek * weeksInPeriod);
  const totalFood = Math.round(foodPerDay * daysLeftEstimate);

  const ongoingExpenses = totalTransport + totalFood + stationery;
  const bills = [];

  if (other > 0) {
    bills.push({ id: 'dayOther', label: 'Everything else', amount: other, frequency: otherFrequency, dueNow: otherDueNow, paid: false });
  }

  const billsDueTotal = bills.reduce(function(sum, b) { return sum + (b.dueNow ? b.amount : 0); }, 0);
  const total = ongoingExpenses + billsDueTotal;

  if (total <= 0 && bills.length === 0) {
    alert('Enter at least one expense.');
    return;
  }

  userAnswers.plannedExpenses = total;
  userAnswers.ongoingExpenses = ongoingExpenses;
  userAnswers.bills = bills;
  userAnswers._needsMigrationNotice = false;
  userAnswers.expenseBreakdown = [
    { label: 'Transport (' + mode + ')', amount: totalTransport },
    { label: 'Food', amount: totalFood },
    { label: 'Stationery / printing', amount: stationery },
    { label: 'Everything else', amount: other }
  ].filter(function(row) { return row.amount > 0; });

  goToAfterQ6();
});

function goToAfterQ6() {
  if (userAnswers._editMode) {
    returnToDashboardFromEdit();
  } else {
    goTo(q6Screen, q7Screen);
  }
}

document.getElementById('q7ContinueBtn').addEventListener('click', function() {
  const name = document.getElementById('goalNameInput').value;
  const target = document.getElementById('goalTargetInput').value;
  const saved = document.getElementById('goalSavedInput').value;
  const contribution = document.getElementById('goalContributionInput').value;

  if (name && target) {
    userAnswers.goal = {
      name: name,
      target: Number(target),
      saved: Number(saved) || 0,
      monthlyContribution: Number(contribution) || 0
    };
  } else {
    userAnswers.goal = null;
  }

  finishQ7();
});

document.getElementById('skipGoalBtn').addEventListener('click', function() {
  userAnswers.goal = null;
  finishQ7();
});

function finishQ7() {
  if (userAnswers._editMode) {
    returnToDashboardFromEdit();
  } else {
    // First time through onboarding — remember the cycle start point for history.
    userAnswers.cycleStartMoney = userAnswers.currentMoney;
    userAnswers.cycleStartDate = getTodayDateString();
    showSnapshot();
  }
}

function calculateDaysLeft() {
  if (userAnswers.usesFallbackDays) {
    return userAnswers.fallbackDays;
  }
  const today = new Date();
  const nextDate = new Date(userAnswers.nextIncomeDate);
  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function showSnapshot() {
  goTo(q7Screen, snapshotScreen);

  const daysLeft = calculateDaysLeft();
  userAnswers.daysLeft = daysLeft;

  document.getElementById('snapshotCurrentMoney').textContent =
    'Rs. ' + userAnswers.currentMoney.toLocaleString();

  document.getElementById('snapshotDaysLeft').textContent =
    daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' until your next income';

  if (userAnswers.usesFallbackDays) {
    document.getElementById('snapshotNextIncome').textContent =
      'Planning based on your own timeline';
  } else {
    document.getElementById('snapshotNextIncome').textContent =
      'Next income: Rs. ' + userAnswers.nextIncomeAmount.toLocaleString() + ' on ' + userAnswers.nextIncomeDate;
  }

  saveAnswers();
}

document.getElementById('snapshotContinueBtn').addEventListener('click', function() {
  goTo(snapshotScreen, dashboardScreen);
  showDashboard();
});

function getDueNowTotal() {
  const ongoing = userAnswers.ongoingExpenses || 0;
  const bills = userAnswers.bills || [];
  const billsDue = bills.reduce(function(sum, b) {
    return sum + (b.dueNow ? b.amount : 0);
  }, 0);
  return ongoing + billsDue;
}

function getRemaining() {
  return userAnswers.currentMoney - getDueNowTotal();
}

function calculateDaysLeftSafe() {
  return userAnswers.daysLeft || 0;
}

// ===== Income confirmation, now also closes out the cycle into history =====

function isIncomePastDue() {
  if (userAnswers.usesFallbackDays || !userAnswers.nextIncomeDate) return false;
  const today = new Date();
  const nextDate = new Date(userAnswers.nextIncomeDate);
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);
  return today >= nextDate;
}

function resetIncomeConfirmUI() {
  document.getElementById('differentAmountBox').classList.add('hidden');
  document.getElementById('followUpBox').classList.add('hidden');
  document.getElementById('differentAmountInput').value = '';
  document.getElementById('followUpDateInput').value = '';
  document.getElementById('followUpAmountInput').value = '';
}

function updateIncomeConfirmCard() {
  const card = document.getElementById('incomeConfirmCard');
  const text = document.getElementById('incomeConfirmText');

  if (!isIncomePastDue()) {
    card.classList.add('hidden');
    return;
  }

  card.classList.remove('hidden');
  text.textContent = 'Did your Rs. ' + userAnswers.nextIncomeAmount.toLocaleString() + ' income land yet?';
  resetIncomeConfirmUI();
  document.querySelector('.income-confirm-btns').classList.remove('hidden');
}

// Records the cycle that's ending into history, before the numbers get overwritten.
function closeOutCycleIntoHistory() {
  const startMoney = userAnswers.cycleStartMoney !== undefined ? userAnswers.cycleStartMoney : userAnswers.currentMoney;
  const remainingAtClose = getRemaining();
  const spentThisCycle = startMoney - remainingAtClose;
  const savedTowardGoal = userAnswers.goal ? userAnswers.goal.monthlyContribution : 0;

  userAnswers.cycleHistory = userAnswers.cycleHistory || [];
  userAnswers.cycleHistory.unshift({
    startDate: userAnswers.cycleStartDate || 'unknown',
    endDate: getTodayDateString(),
    startMoney: startMoney,
    spent: spentThisCycle > 0 ? spentThisCycle : 0,
    leftOver: remainingAtClose,
    savedSomething: (remainingAtClose > 0) || (savedTowardGoal > 0)
  });

  // Keep the list from growing forever, most recent 24 cycles is plenty.
  userAnswers.cycleHistory = userAnswers.cycleHistory.slice(0, 24);
}

function applyIncomeAndShowFollowUp(amount) {
  closeOutCycleIntoHistory();

  userAnswers.currentMoney += amount;
  userAnswers.bills = (userAnswers.bills || []).filter(function(b) { return !b.paid; });
  saveAnswers();

  document.querySelector('.income-confirm-btns').classList.add('hidden');
  document.getElementById('differentAmountBox').classList.add('hidden');
  document.getElementById('followUpBox').classList.remove('hidden');
  document.getElementById('incomeConfirmText').textContent =
    'Added Rs. ' + amount.toLocaleString() + ' to your balance.';
}

document.getElementById('confirmExactBtn').addEventListener('click', function() {
  applyIncomeAndShowFollowUp(userAnswers.nextIncomeAmount);
});

document.getElementById('confirmDifferentBtn').addEventListener('click', function() {
  document.querySelector('.income-confirm-btns').classList.add('hidden');
  document.getElementById('differentAmountBox').classList.remove('hidden');
});

document.getElementById('differentAmountConfirmBtn').addEventListener('click', function() {
  const value = Number(document.getElementById('differentAmountInput').value);
  if (!value || value < 0) {
    alert('Enter how much actually came in.');
    return;
  }
  applyIncomeAndShowFollowUp(value);
});

document.getElementById('notYetBtn').addEventListener('click', function() {
  document.getElementById('incomeConfirmCard').classList.add('hidden');
});

document.getElementById('followUpSaveBtn').addEventListener('click', function() {
  const date = document.getElementById('followUpDateInput').value;
  const amount = document.getElementById('followUpAmountInput').value;

  if (!date || !amount || Number(amount) < 0) {
    alert('Enter your next income date and amount to roll the cycle forward.');
    return;
  }

  userAnswers.nextIncomeDate = date;
  userAnswers.nextIncomeAmount = Number(amount);
  userAnswers.usesFallbackDays = false;
  userAnswers.daysLeft = calculateDaysLeft();

  // New cycle starts now.
  userAnswers.cycleStartMoney = userAnswers.currentMoney;
  userAnswers.cycleStartDate = getTodayDateString();

  document.getElementById('incomeConfirmCard').classList.add('hidden');
  showDashboard();
});

// ===== Migration notice =====

function updateMigrationNotice() {
  const note = document.getElementById('migrationNote');
  if (userAnswers._needsMigrationNotice) {
    note.classList.remove('hidden');
  } else {
    note.classList.add('hidden');
  }
}

document.getElementById('migrationDismissBtn').addEventListener('click', function() {
  userAnswers._needsMigrationNotice = false;
  saveAnswers();
  document.getElementById('migrationNote').classList.add('hidden');
});

// ===== Donut chart =====

const donutColors = ['#D9628F', '#8B76BF', '#B85321', '#5F6E3A', '#F4D35E', '#E8763A', '#B8A9D9'];

function renderDonutChart() {
  const wrap = document.getElementById('donutChart');
  const legend = document.getElementById('donutLegend');
  const emptyState = document.getElementById('donutEmptyState');
  const donutCard = document.querySelector('.donut-card');

  const breakdown = userAnswers.expenseBreakdown;

  if (!breakdown || breakdown.length === 0) {
    wrap.innerHTML = '';
    legend.innerHTML = '';
    emptyState.classList.remove('hidden');
    if (donutCard) donutCard.querySelector('.donut-body').classList.add('hidden');
    return;
  }

  if (donutCard) donutCard.querySelector('.donut-body').classList.remove('hidden');
  emptyState.classList.add('hidden');

  const total = breakdown.reduce(function(sum, row) { return sum + row.amount; }, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  let circles = '';
  breakdown.forEach(function(row, i) {
    const fraction = total > 0 ? row.amount / total : 0;
    const dash = fraction * circumference;
    const color = donutColors[i % donutColors.length];

    circles +=
      '<circle cx="50" cy="50" r="' + radius + '" fill="none" stroke="' + color + '" ' +
      'stroke-width="16" stroke-dasharray="' + dash + ' ' + (circumference - dash) + '" ' +
      'stroke-dashoffset="' + (-offsetSoFar) + '" transform="rotate(-90 50 50)"/>';

    offsetSoFar += dash;
  });

  wrap.innerHTML =
    '<svg viewBox="0 0 100 100">' + circles +
    '<circle cx="50" cy="50" r="27" fill="#FAF8FC"/>' +
    '<text x="50" y="47" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="11" fill="#2A2438">Rs.' +
    (total >= 1000 ? Math.round(total / 1000) + 'k' : total) + '</text>' +
    '<text x="50" y="58" text-anchor="middle" font-family="Inter" font-size="6" fill="#6B6178">total</text>' +
    '</svg>';

  legend.innerHTML = '';
  breakdown.forEach(function(row, i) {
    const color = donutColors[i % donutColors.length];
    const rowDiv = document.createElement('div');
    rowDiv.className = 'donut-legend-row';
    rowDiv.innerHTML =
      '<span class="donut-legend-dot" style="background-color:' + color + '"></span>' +
      '<span class="donut-legend-label">' + row.label + '</span>' +
      '<span class="donut-legend-amount">Rs. ' + row.amount.toLocaleString() + '</span>';
    legend.appendChild(rowDiv);
  });
}

// ===== Savings insight =====

function renderInsightCard() {
  const card = document.getElementById('insightCard');
  const textEl = document.getElementById('insightText');
  const breakdown = userAnswers.expenseBreakdown;

  if (!breakdown || breakdown.length === 0) {
    card.classList.add('hidden');
    return;
  }

  const flexibleLabels = ['Food', 'Food / snacks', 'Local transport', 'Stationery / printing', 'Everything else'];
  const flexibleRows = breakdown.filter(function(row) {
    return flexibleLabels.some(function(label) { return row.label.indexOf(label) !== -1 || row.label === label; });
  });

  const candidates = flexibleRows.length > 0 ? flexibleRows : breakdown;
  const biggest = candidates.reduce(function(max, row) {
    return row.amount > max.amount ? row : max;
  }, candidates[0]);

  if (!biggest || biggest.amount <= 0) {
    card.classList.add('hidden');
    return;
  }

  const cutAmount = Math.round(biggest.amount * 0.1);

  card.classList.remove('hidden');
  textEl.innerHTML =
    'Your biggest flexible expense is <strong>' + biggest.label + '</strong> at Rs. ' + biggest.amount.toLocaleString() + '. ' +
    'Cutting it by just 10% would free up Rs. ' + cutAmount.toLocaleString() + ' this cycle.';
}

// ===== Bills card =====

const billFrequencyLabels = {
  onetime: 'One-time',
  monthly: 'Every month',
  semester: 'Every 6 months'
};

function renderBillsCard() {
  const card = document.getElementById('billsCard');
  const list = document.getElementById('billsList');
  const bills = userAnswers.bills || [];

  list.innerHTML = '';

  if (bills.length === 0) {
    card.classList.add('hidden');
    return;
  }

  card.classList.remove('hidden');

  bills.forEach(function(bill) {
    const dueTag = bill.dueNow ? 'Due before next income' : 'Not due yet';
    const row = document.createElement('div');
    row.className = 'bill-row';
    row.innerHTML =
      '<button class="bill-row-toggle ' + (bill.paid ? 'checked' : '') + '" data-bill-id="' + bill.id + '" aria-label="Mark paid"></button>' +
      '<div class="bill-row-text">' +
        '<p class="bill-row-label ' + (bill.paid ? 'paid' : '') + '">' + bill.label + '</p>' +
        '<p class="bill-row-freq">' + billFrequencyLabels[bill.frequency] + ' &middot; ' + dueTag + '</p>' +
      '</div>' +
      '<p class="bill-row-amount">Rs. ' + bill.amount.toLocaleString() + '</p>';
    list.appendChild(row);
  });

  list.querySelectorAll('.bill-row-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.getAttribute('data-bill-id');
      const bill = userAnswers.bills.find(function(b) { return b.id === id; });
      if (bill) {
        bill.paid = !bill.paid;
        saveAnswers();
        showDashboard();
      }
    });
  });
}

// ===== Challenges, now supports several running at once =====

const CHALLENGE_LIBRARY = [
  { id: 'noSpend7', title: '7-Day No Spending Challenge', tagline: 'Go a full week without a single non-essential rupee spent.', days: 7 },
  { id: 'delivery3', title: '3-Day Food Delivery Detox', tagline: 'No food delivery apps for three days straight. Cook or eat what you have.', days: 3 },
  { id: 'track5', title: '5-Day Track Every Rupee', tagline: 'Note down every single purchase, no matter how small, for five days.', days: 5 },
  { id: 'savingsStreak14', title: '14-Day Savings Streak', tagline: 'Put something, anything, toward your goal every day for two weeks.', days: 14 }
];

function getTodayDateString() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function isChallengeActive(libraryId) {
  return (userAnswers.activeChallenges || []).some(function(c) { return c.id === libraryId; });
}

function hasCheckedInToday(challenge) {
  return challenge.checkedDates.indexOf(getTodayDateString()) !== -1;
}

function startChallenge(libraryId) {
  if (isChallengeActive(libraryId)) return;
  const def = CHALLENGE_LIBRARY.find(function(c) { return c.id === libraryId; });
  if (!def) return;

  userAnswers.activeChallenges = userAnswers.activeChallenges || [];
  userAnswers.activeChallenges.push({
    id: def.id,
    title: def.title,
    days: def.days,
    checkedDates: []
  });
  saveAnswers();
  renderChallengesScreen();
  showDashboard();
}

function checkInToday(libraryId) {
  const list = userAnswers.activeChallenges || [];
  const c = list.find(function(x) { return x.id === libraryId; });
  if (!c || hasCheckedInToday(c)) return;

  c.checkedDates.push(getTodayDateString());

  if (c.checkedDates.length >= c.days) {
    userAnswers.completedChallenges.push({
      id: c.id,
      title: c.title,
      completedOn: getTodayDateString()
    });
    userAnswers.activeChallenges = list.filter(function(x) { return x.id !== libraryId; });
    saveAnswers();
    renderChallengesScreen(c.title);
    showDashboard();
    setTimeout(fireConfetti, 300);
    return;
  }

  saveAnswers();
  renderChallengesScreen();
  showDashboard();
}

function quitChallenge(libraryId) {
  if (!confirm('Quit this challenge? Your progress on it will be lost.')) return;
  userAnswers.activeChallenges = (userAnswers.activeChallenges || []).filter(function(x) { return x.id !== libraryId; });
  saveAnswers();
  renderChallengesScreen();
  showDashboard();
}

function renderChallengesScreen(justCompletedTitle) {
  const content = document.getElementById('challengesScreenContent');
  const badge = document.querySelector('#challengesScreen .badge');

  if (justCompletedTitle) {
    badge.textContent = 'challenge complete';
    badge.className = 'badge challenge-complete-badge';
    content.innerHTML =
      '<h2 class="challenge-complete-title">You did it.</h2>' +
      '<p class="sub-label">"' + justCompletedTitle + '" complete. That one is going in your wins.</p>' +
      '<p class="link-text" id="backToLibraryLink">Back to challenges</p>';
    document.getElementById('backToLibraryLink').addEventListener('click', function() {
      renderChallengesScreen();
    });
    return;
  }

  badge.textContent = 'challenges';
  badge.className = 'badge';

  const active = userAnswers.activeChallenges || [];
  let html = '';

  if (active.length > 0) {
    html += '<div class="active-challenges-list">';
    active.forEach(function(c) {
      const checkedIn = hasCheckedInToday(c);
      let dots = '';
      for (let i = 0; i < c.days; i++) {
        dots += '<div class="challenge-dot ' + (i < c.checkedDates.length ? 'filled' : '') + '"></div>';
      }
      html +=
        '<div class="active-challenge-block">' +
          '<div class="challenge-active-header">' +
            '<h2 class="challenge-active-name">' + c.title + '</h2>' +
            '<p class="challenge-active-count">' + c.checkedDates.length + '<span> / ' + c.days + ' days</span></p>' +
          '</div>' +
          '<div class="challenge-dots-row">' + dots + '</div>' +
          '<button class="continue-btn checkin-btn" data-check-id="' + c.id + '" ' + (checkedIn ? 'disabled' : '') + '>' +
            (checkedIn ? "You're checked in for today" : 'Check in for today') +
          '</button>' +
          (checkedIn ? '<p class="challenge-checkin-note">Come back tomorrow to check in again.</p>' : '') +
          '<p class="challenge-quit-link" data-quit-id="' + c.id + '">Quit this challenge</p>' +
        '</div>';
    });
    html += '</div>';
  }

  html += '<p class="sub-label" style="margin-top:0;">' + (active.length > 0 ? 'Add another one, or leave it here.' : 'Pick one to start. You can run more than one at a time.') + '</p><div class="challenge-lib-grid">';
  CHALLENGE_LIBRARY.forEach(function(def) {
    const isActive = isChallengeActive(def.id);
    html +=
      '<button class="challenge-lib-card ' + (isActive ? 'already-active' : '') + '" data-challenge-id="' + def.id + '" ' + (isActive ? 'disabled' : '') + '>' +
        '<div class="challenge-lib-top">' +
          '<span class="challenge-lib-title">' + def.title + (isActive ? ' (already running)' : '') + '</span>' +
          '<span class="challenge-lib-days">' + def.days + ' days</span>' +
        '</div>' +
        '<p class="challenge-lib-tagline">' + def.tagline + '</p>' +
      '</button>';
  });
  html += '</div>';

  content.innerHTML = html;

  content.querySelectorAll('.challenge-lib-card:not(.already-active)').forEach(function(btn) {
    btn.addEventListener('click', function() {
      startChallenge(btn.getAttribute('data-challenge-id'));
    });
  });
  content.querySelectorAll('.checkin-btn:not(:disabled)').forEach(function(btn) {
    btn.addEventListener('click', function() {
      checkInToday(btn.getAttribute('data-check-id'));
    });
  });
  content.querySelectorAll('[data-quit-id]').forEach(function(link) {
    link.addEventListener('click', function() {
      quitChallenge(link.getAttribute('data-quit-id'));
    });
  });
}

function renderChallengeTeaser() {
  const btn = document.getElementById('challengeTeaserBtn');
  const content = document.getElementById('challengeTeaserContent');
  const active = userAnswers.activeChallenges || [];

  if (active.length === 0) {
    btn.classList.remove('has-active-challenge');
    content.innerHTML =
      '<div class="challenge-teaser-idle">' +
        '<p class="challenge-teaser-title">Challenges</p>' +
        '<p class="challenge-teaser-sub">Pick a small challenge and build a streak.</p>' +
      '</div>';
    return;
  }

  btn.classList.add('has-active-challenge');
  let html = '';
  active.forEach(function(c) {
    const percent = Math.min(100, Math.round((c.checkedDates.length / c.days) * 100));
    html +=
      '<div class="challenge-teaser-active-item">' +
        '<div class="challenge-teaser-active-top">' +
          '<span class="challenge-teaser-active-name">' + c.title + '</span>' +
          '<span class="challenge-teaser-active-count">Day ' + c.checkedDates.length + '/' + c.days + '</span>' +
        '</div>' +
        '<div class="challenge-teaser-bar"><div class="challenge-teaser-bar-fill" style="width:' + percent + '%"></div></div>' +
      '</div>';
  });
  content.innerHTML = html;
}

document.getElementById('challengeTeaserBtn').addEventListener('click', function() {
  renderChallengesScreen();
  goTo(dashboardScreen, challengesScreen);
});

document.getElementById('challengesBackBtn').addEventListener('click', function() {
  goTo(challengesScreen, dashboardScreen);
});

function updateMascotMessage() {
  const bubble = document.getElementById('mascotMessage');
  const remaining = getRemaining();
  const currentMoney = userAnswers.currentMoney || 0;
  const active = userAnswers.activeChallenges || [];
  const pendingChallenge = active.find(function(c) { return !hasCheckedInToday(c); });

  if (isIncomePastDue()) {
    bubble.textContent = "Psst, is your income in yet?";
  } else if (pendingChallenge) {
    bubble.textContent = 'Day ' + (pendingChallenge.checkedDates.length + 1) + ' of ' + pendingChallenge.days + '. Check in today.';
  } else if (active.length > 0) {
    bubble.textContent = "Today's logged. Keep going.";
  } else if (remaining < 0) {
    bubble.textContent = "You're short for what's due. Let's sort it.";
  } else if (currentMoney > 0 && remaining / currentMoney > 0.5) {
    bubble.textContent = 'Smart moves, pretty privileges.';
  } else if (currentMoney > 0 && remaining / currentMoney > 0.2) {
    bubble.textContent = "You're doing okay. Stay sharp.";
  } else {
    bubble.textContent = "It's getting tight out here.";
  }
}

function renderWinsStrip() {
  const strip = document.getElementById('winsStrip');
  strip.innerHTML = '';

  const remaining = getRemaining();
  const wins = [];

  if (remaining > 0) {
    wins.push('Covered for now, Rs. ' + remaining.toLocaleString() + ' left');
  }

  const bills = userAnswers.bills || [];
  const paidBills = bills.filter(function(b) { return b.paid; });
  if (paidBills.length > 0) {
    wins.push(paidBills.length + ' bill' + (paidBills.length === 1 ? '' : 's') + ' marked paid');
  }

  const completed = userAnswers.completedChallenges || [];
  if (completed.length > 0) {
    wins.push('Completed ' + completed[completed.length - 1].title);
  }

  if (userAnswers.goal && userAnswers.goal.saved > 0) {
    const percent = Math.min(100, Math.round((userAnswers.goal.saved / userAnswers.goal.target) * 100));
    if (percent > 0) {
      wins.push(percent + '% closer to ' + userAnswers.goal.name);
    }
  }

  if (userAnswers.expenseBreakdown && userAnswers.expenseBreakdown.length > 0) {
    wins.push('Expenses broken down and tracked');
  }

  if (wins.length === 0) {
    const chip = document.createElement('div');
    chip.className = 'win-chip win-empty';
    chip.textContent = 'Check back once you have a few wins to show';
    strip.appendChild(chip);
    return;
  }

  wins.forEach(function(text) {
    const chip = document.createElement('div');
    chip.className = 'win-chip';
    chip.textContent = text;
    strip.appendChild(chip);
  });
}

function buildGoalScreenContent() {
  if (!userAnswers.goal) {
    return '<h2>No goal set yet</h2><p class="sub-label">Use Edit My Info to add one.</p>';
  }
  const g = userAnswers.goal;
  const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
  const remaining = g.target - g.saved;
  const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : null;

  return (
    '<h2>' + g.name + '</h2>' +
    '<div class="progress-bar-static"><div class="progress-fill-static" style="width:' + percent + '%"></div></div>' +
    '<p class="sub-label">Rs. ' + g.saved.toLocaleString() + ' / Rs. ' + g.target.toLocaleString() + ' (' + percent + '%)</p>' +
    (monthsLeft !== null
      ? '<p class="sub-label">At Rs. ' + g.monthlyContribution.toLocaleString() + '/month, about ' + monthsLeft + ' month' + (monthsLeft === 1 ? '' : 's') + ' left.</p>'
      : '<p class="sub-label">Set a monthly contribution in Edit My Info to see a timeline.</p>')
  );
}

function updateGoalTeaser() {
  const text = document.getElementById('goalTeaserText');
  const percentEl = document.getElementById('goalTeaserPercent');
  const fill = document.getElementById('goalTeaserFill');
  const empty = document.getElementById('goalTeaserEmpty');

  if (!userAnswers.goal) {
    text.textContent = 'No goal set yet';
    percentEl.classList.add('hidden');
    fill.style.width = '0%';
    empty.classList.remove('hidden');
    return;
  }

  const g = userAnswers.goal;
  const percent = Math.min(100, Math.round((g.saved / g.target) * 100));

  text.textContent = g.name;
  percentEl.textContent = percent + '%';
  percentEl.classList.remove('hidden');
  fill.style.width = percent + '%';
  empty.classList.add('hidden');
}

// ===== History screen =====

function formatShortDate(isoString) {
  if (!isoString || isoString === 'unknown') return 'Unknown date';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderHistoryScreen() {
  const content = document.getElementById('historyScreenContent');
  const history = userAnswers.cycleHistory || [];

  if (history.length === 0) {
    content.innerHTML =
      '<h2>Nothing here yet</h2>' +
      '<p class="history-empty">Once your first income cycle wraps up and you confirm your next income, it will show up here.</p>';
    return;
  }

  let html = '<h2>Cycle by cycle</h2><div class="history-list">';
  history.forEach(function(entry) {
    const savedTagClass = entry.savedSomething ? 'saved-yes' : 'saved-no';
    const savedTagText = entry.savedSomething ? 'Saved something' : 'Nothing left over';
    html +=
      '<div class="history-entry">' +
        '<div class="history-entry-top">' +
          '<span class="history-entry-dates">' + formatShortDate(entry.startDate) + ' &rarr; ' + formatShortDate(entry.endDate) + '</span>' +
          '<span class="history-entry-saved-tag ' + savedTagClass + '">' + savedTagText + '</span>' +
        '</div>' +
        '<div class="history-entry-row"><span>Started with</span><strong>Rs. ' + entry.startMoney.toLocaleString() + '</strong></div>' +
        '<div class="history-entry-row"><span>Spent</span><strong>Rs. ' + entry.spent.toLocaleString() + '</strong></div>' +
        '<div class="history-entry-row"><span>Left over</span><strong>Rs. ' + entry.leftOver.toLocaleString() + '</strong></div>' +
      '</div>';
  });
  html += '</div>';

  content.innerHTML = html;
}

document.getElementById('openHistoryBtn').addEventListener('click', function() {
  renderHistoryScreen();
  goTo(dashboardScreen, historyScreen);
});

document.getElementById('historyBackBtn').addEventListener('click', function() {
  goTo(historyScreen, dashboardScreen);
});

function showDashboard() {
  const remaining = getRemaining();
  const daysLeft = calculateDaysLeftSafe();
  const isShort = remaining < 0;
  const displayRemaining = isShort ? 0 : remaining;
  const dailySpend = isShort ? 0 : (daysLeft > 0 ? Math.floor(remaining / daysLeft) : remaining);

  const heroCard = document.querySelector('.hero-stat-card');
  const shortfallEl = document.getElementById('heroShortfall');

  document.getElementById('statBalance').textContent = 'Rs. ' + userAnswers.currentMoney.toLocaleString();
  document.getElementById('statSpent').textContent = 'Rs. ' + userAnswers.plannedExpenses.toLocaleString();
  document.getElementById('statLeft').textContent = 'Rs. ' + displayRemaining.toLocaleString();
  document.getElementById('statDaysLeft').textContent =
    daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' left';

  if (isShort) {
    heroCard.classList.add('hero-shortfall-state');
    shortfallEl.textContent = "Short by Rs. " + Math.abs(remaining).toLocaleString() + " for what's due before your next income.";
    shortfallEl.classList.remove('hidden');
    document.getElementById('statDaily').textContent = 'Sort the shortfall first';
  } else {
    heroCard.classList.remove('hero-shortfall-state');
    shortfallEl.classList.add('hidden');
    document.getElementById('statDaily').textContent = 'Rs. ' + dailySpend.toLocaleString() + '/day';
  }

  updateMigrationNotice();
  updateIncomeConfirmCard();
  renderDonutChart();
  renderInsightCard();
  renderBillsCard();
  renderChallengeTeaser();
  updateMascotMessage();
  renderWinsStrip();
  updateGoalTeaser();

  if (!isShort && !isIncomePastDue() && remaining > 0 && userAnswers.currentMoney > 0 && (remaining / userAnswers.currentMoney) > 0.5) {
    setTimeout(fireConfetti, 400);
  }

  saveAnswers();
}

// ===== Dashboard block navigation =====

document.getElementById('openAffordBtn').addEventListener('click', function() {
  document.getElementById('affordItemInput').value = '';
  document.getElementById('affordPriceInput').value = '';
  document.getElementById('affordResult').classList.add('hidden');
  goTo(dashboardScreen, affordScreen);
});

document.getElementById('affordBackBtn').addEventListener('click', function() {
  goTo(affordScreen, dashboardScreen);
});
document.getElementById('affordDoneBtn').addEventListener('click', function() {
  goTo(affordScreen, dashboardScreen);
});

document.getElementById('affordCheckBtn').addEventListener('click', function() {
  const item = document.getElementById('affordItemInput').value || 'this';
  const price = Number(document.getElementById('affordPriceInput').value);

  if (!price || price <= 0) {
    alert('Enter a price to check.');
    return;
  }

  const remaining = getRemaining();
  const daysLeft = calculateDaysLeftSafe();
  const protectedSavings = userAnswers.goal ? userAnswers.goal.monthlyContribution : 0;

  const availableAfterSavings = remaining - protectedSavings;
  const afterPurchase = remaining - price;
  const afterPurchaseAndSavings = availableAfterSavings - price;

  const dailyAfter = daysLeft > 0 ? Math.floor(afterPurchaseAndSavings / daysLeft) : afterPurchaseAndSavings;
  const normalDaily = daysLeft > 0 ? Math.floor(availableAfterSavings / daysLeft) : availableAfterSavings;

  let verdictClass, verdictText, line1, line2, line3;

  if (afterPurchase < 0) {
    verdictClass = 'verdict-risky';
    verdictText = "Maybe don't YOLO this one.";
    line1 = 'You do not have enough left to cover ' + item + '.';
    line2 = 'You would be Rs. ' + Math.abs(afterPurchase).toLocaleString() + ' short.';
    line3 = 'Your protected savings goal was not even touched in this check.';
  } else if (afterPurchaseAndSavings < 0) {
    verdictClass = 'verdict-tight';
    verdictText = 'Tight. This eats into your savings.';
    line1 = 'You can cover ' + item + ', but it dips into your Rs. ' + protectedSavings.toLocaleString() + ' savings plan.';
    line2 = 'You would be short by Rs. ' + Math.abs(afterPurchaseAndSavings).toLocaleString() + ' toward that goal this cycle.';
    line3 = 'Your call: skip the goal contribution this time, or skip the buy.';
  } else if (dailyAfter < normalDaily * 0.5) {
    verdictClass = 'verdict-manageable';
    verdictText = 'Manageable, but you will feel it.';
    line1 = 'After buying ' + item + ', your safe daily spend drops to Rs. ' + dailyAfter.toLocaleString() + '/day.';
    line2 = 'That is down from your usual Rs. ' + normalDaily.toLocaleString() + '/day.';
    line3 = 'Your savings goal stays protected.';
  } else {
    verdictClass = 'verdict-comfortable';
    verdictText = 'Yep, go for it.';
    line1 = 'You can afford ' + item + ' without much stress.';
    line2 = 'Daily spend after: Rs. ' + dailyAfter.toLocaleString() + '/day, barely different from usual.';
    line3 = 'Your savings goal stays protected.';
  }

  document.getElementById('affordVerdict').textContent = verdictText;
  document.getElementById('affordVerdict').className = 'afford-verdict ' + verdictClass;
  document.getElementById('affordLine1').textContent = line1;
  document.getElementById('affordLine2').textContent = line2;
  document.getElementById('affordLine3').textContent = line3;
  document.getElementById('affordResult').classList.remove('hidden');

  if (verdictClass === 'verdict-comfortable') {
    setTimeout(fireConfetti, 200);
  }
});

document.getElementById('openTargetBtn').addEventListener('click', function() {
  document.getElementById('targetInput').value = '';
  document.getElementById('targetResult').classList.add('hidden');
  goTo(dashboardScreen, targetScreen);
});

document.getElementById('targetBackBtn').addEventListener('click', function() {
  goTo(targetScreen, dashboardScreen);
});
document.getElementById('targetDoneBtn').addEventListener('click', function() {
  goTo(targetScreen, dashboardScreen);
});

document.getElementById('targetCheckBtn').addEventListener('click', function() {
  const target = Number(document.getElementById('targetInput').value);

  if (!target || target <= 0) {
    alert('Enter a daily target to check.');
    return;
  }

  const remaining = getRemaining();
  const daysLeft = calculateDaysLeftSafe();
  const currentDaily = daysLeft > 0 ? Math.floor(remaining / daysLeft) : remaining;
  const neededTotal = target * daysLeft;
  const gap = remaining - neededTotal;

  let verdictClass, verdictText, line1, line2;

  if (currentDaily >= target) {
    verdictClass = 'verdict-comfortable';
    verdictText = "You're already on track.";
    line1 = 'Your current safe daily spend is Rs. ' + currentDaily.toLocaleString() + '/day.';
    line2 = 'That already meets your Rs. ' + target.toLocaleString() + '/day target, with Rs. ' + gap.toLocaleString() + ' to spare.';
    setTimeout(fireConfetti, 200);
  } else {
    verdictClass = 'verdict-tight';
    verdictText = "You'll need to free up some cash.";
    line1 = 'At Rs. ' + target.toLocaleString() + '/day for ' + daysLeft + ' days, you need Rs. ' + neededTotal.toLocaleString() + ' total.';
    line2 = 'You are currently short by Rs. ' + Math.abs(gap).toLocaleString() + '. Something has to give.';
  }

  document.getElementById('targetVerdict').textContent = verdictText;
  document.getElementById('targetVerdict').className = 'afford-verdict ' + verdictClass;
  document.getElementById('targetLine1').textContent = line1;
  document.getElementById('targetLine2').textContent = line2;
  document.getElementById('targetResult').classList.remove('hidden');
});

document.getElementById('openGoalTeaserBtn').addEventListener('click', function() {
  document.getElementById('goalScreenContent').innerHTML = buildGoalScreenContent();
  if (userAnswers.goal) {
    const percent = Math.min(100, Math.round((userAnswers.goal.saved / userAnswers.goal.target) * 100));
    if (percent >= 100) setTimeout(fireConfetti, 300);
  }
  goTo(dashboardScreen, goalScreen);
});

document.getElementById('goalTeaserBtn').addEventListener('click', function() {
  document.getElementById('goalScreenContent').innerHTML = buildGoalScreenContent();
  if (userAnswers.goal) {
    const percent = Math.min(100, Math.round((userAnswers.goal.saved / userAnswers.goal.target) * 100));
    if (percent >= 100) setTimeout(fireConfetti, 300);
  }
  goTo(dashboardScreen, goalScreen);
});

document.getElementById('goalBackBtn').addEventListener('click', function() {
  goTo(goalScreen, dashboardScreen);
});

// ===== Edit My Info =====

document.getElementById('openEditBtn').addEventListener('click', function() {
  goTo(dashboardScreen, editChoiceScreen);
});

document.getElementById('editChoiceBackBtn').addEventListener('click', function() {
  goTo(editChoiceScreen, dashboardScreen);
});

document.getElementById('clearAllBtn').addEventListener('click', function() {
  if (confirm('This deletes everything and starts fresh. Are you sure?')) {
    localStorage.removeItem('soojhData');
    userAnswers = {};
    goTo(editChoiceScreen, q1Screen);
  }
});

const editableFields = [
  { label: 'Where you live', screen: q1Screen },
  { label: 'Where your money comes from', screen: q2Screen },
  { label: 'How much money you have right now', screen: q3Screen },
  { label: 'When your next income arrives', screen: q4Screen },
  { label: 'How much your next income will be', screen: q5Screen },
  { label: 'Your planned expenses', screen: q6Screen },
  { label: 'Your savings goal', screen: q7Screen }
];

document.getElementById('editOneBtn').addEventListener('click', function() {
  rebuildEditPickList();
  goTo(editChoiceScreen, editPickScreen);
});

document.getElementById('editPickBackBtn').addEventListener('click', function() {
  goTo(editPickScreen, editChoiceScreen);
});

function updateEditBackLinks() {
  document.querySelectorAll('.edit-back-link').forEach(function(link) {
    if (userAnswers._editMode) {
      link.classList.remove('hidden');
    } else {
      link.classList.add('hidden');
    }
  });
}

document.querySelectorAll('.edit-back-link').forEach(function(link) {
  link.addEventListener('click', function() {
    const currentScreen = link.closest('.screen');
    userAnswers._editMode = true;
    goTo(currentScreen, editPickScreen);
    rebuildEditPickList();
  });
});

function rebuildEditPickList() {
  const list = document.getElementById('editPickList');
  list.innerHTML = '';
  editableFields.forEach(function(field) {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.textContent = field.label;
    btn.addEventListener('click', function() {
      userAnswers._editMode = true;
      updateEditBackLinks();
      goTo(editPickScreen, field.screen);
    });
    list.appendChild(btn);
  });
}

function returnToDashboardFromEdit() {
  userAnswers._editMode = false;
  updateEditBackLinks();
  userAnswers.daysLeft = calculateDaysLeft();
  saveAnswers();
  const currentScreen = allScreens.find(function(s) { return !s.classList.contains('hidden'); });
  if (currentScreen) {
    goTo(currentScreen, dashboardScreen);
  } else {
    hideAllExcept(dashboardScreen);
  }
  showDashboard();
}

// ===== Confetti =====

const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const confettiColors = ['#8B76BF', '#F0A8C4', '#D9628F', '#E8763A', '#F4D35E'];

function fireConfetti() {
  const pieces = [];
  const count = 80;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 4,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.35
    });
  }

  let frame = 0;
  const maxFrames = 90;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    pieces.forEach(function(p) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}