const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000; // ~120 days
const MIN_AGE = 18;
const MAX_AGE = 60;
const MIN_WEIGHT = 50;
const cutoff = new Date(Date.now() - FOUR_MONTHS_MS);
const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - MIN_AGE); // born before this = 18+
const minDob = new Date();
minDob.setFullYear(minDob.getFullYear() - MAX_AGE); // born after this = <=60

const checkEligible = (user) => {
  if (!user) return false;
  if (!user.isWillingToDonate) return false;
  if (user.weight <= MIN_WEIGHT) return false;
  if (
    !user.dateOfBirth ||
    user.dateOfBirth > maxDob ||
    user.dateOfBirth < minDob
  )
    return false;
  if (user.lastDonationDate && user.lastDonationDate > cutoff) return false;
  return true;
};

export { checkEligible };
