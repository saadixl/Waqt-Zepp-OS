import { BaseSideService } from "@zeppos/zml/base-side";
let currentLocationIndex = 0;

const supportedLocations = [
  { city: 'Singapore', country: 'Singapore'},
  { city: 'Dhaka', country: 'Bangladesh'},
  { city: 'Makkah', country: 'SaudiArabia'},
  { city: 'London', country: 'UK'},
  { city: 'NY', country: 'USA'},
];

function isTimeAfterNow(givenTime) {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Parse time string - could be "05:30 (EAT)" or "05:30" format
  const timeOnly = givenTime.split(' ')[0]; // Get "05:30" part
  const [givenHours, givenMinutes] = timeOnly.split(":").map(Number);
  
  if (givenHours > currentHours) {
    return true;
  } else if (givenHours === currentHours) {
    return givenMinutes > currentMinutes;
  } else {
    return false;
  }
}

function findNextPrayerIndex(timings) {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  // Check each prayer in order
  for (let i = 0; i < prayerOrder.length; i++) {
    const prayerName = prayerOrder[i];
    const timeStr = timings[prayerName];
    if (!timeStr) continue;
    
    const timeOnly = timeStr.split(' ')[0];
    const [hours, minutes] = timeOnly.split(":").map(Number);
    
    if (hours > currentHours || (hours === currentHours && minutes > currentMinutes)) {
      return i; // Found the next prayer
    }
  }
  
  // If no prayer found (all have passed, meaning after Isha), Fajr is the next prayer (tomorrow)
  return 0; // Fajr is the next prayer
}

function formatTimeString(timeStr) {
  // Parse time string like "05:30 (EAT)" or "05:30 AM" and format it
  // Remove timezone info if present
  const timeOnly = timeStr.split(' ')[0]; // Get "05:30" part
  const [hours, minutes] = timeOnly.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function formatTime(title, time, isNextPrayer) {
  return {
    title,
    isUpcoming: isNextPrayer,
    time: formatTimeString(time),
  };
}

async function fetchPrayerTimes(res, action) {
  try {
    // Handle city selection by index
    if (action && action.startsWith('CITY_')) {
      const cityIndex = parseInt(action.split('_')[1]);
      if (cityIndex >= 0 && cityIndex < supportedLocations.length) {
        currentLocationIndex = cityIndex;
      }
    } else if (action === 'UP') {
      if (currentLocationIndex === 0) {
        currentLocationIndex = supportedLocations.length - 1;
      } else {
        currentLocationIndex--;
      }
    } else if (action === 'DOWN') {
      if (currentLocationIndex === supportedLocations.length - 1) {
        currentLocationIndex = 0;
      } else {
        currentLocationIndex++;
      }
    }
    const location = supportedLocations[currentLocationIndex];
    const response = await fetch({
      url: `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}`,
      method: 'GET'
    })
    const resBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
    const timings = resBody.status === 'OK' ? resBody.data.timings : null;
    let result = [];
    if (timings) {
      // Find which prayer is next (handles wrap-around: after Isha, Fajr is next)
      const nextPrayerIndex = findNextPrayerIndex(timings);
      
      const fajr = formatTime("Fajr", timings.Fajr, nextPrayerIndex === 0);
      const sunrise = formatTime("Sunrise", timings.Sunrise, nextPrayerIndex === 1);
      const dhuhr = formatTime("Dhuhr", timings.Dhuhr, nextPrayerIndex === 2);
      const asr = formatTime("Asr", timings.Asr, nextPrayerIndex === 3);
      const maghrib = formatTime("Maghrib", timings.Maghrib, nextPrayerIndex === 4);
      const isha = formatTime("Isha", timings.Isha, nextPrayerIndex === 5);
      result = [fajr, sunrise, dhuhr, asr, maghrib, isha];
    }
    res(null, {
      result,
      city: location.city,
    });
  } catch (error) {
    res(null, {
      result: "ERROR",
    });
  }
};

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      console.log("=====>,", req.method);
      if (req.method === "GET_DATA") {
        fetchPrayerTimes(res, req.params["action"]);
      }
    },

    onRun() { },

    onDestroy() { },
  })
);
