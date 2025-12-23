import { BaseSideService } from "@zeppos/zml/base-side";
let currentLocationIndex = 0;

// Singapore is first (default city)
const supportedLocations = [
  { city: 'Singapore', country: 'Singapore', timezone: 'SGT', offset: 8},
  { city: 'Sydney', country: 'Australia', timezone: 'AEST', offset: 10},
  { city: 'Tokyo', country: 'Japan', timezone: 'JST', offset: 9},
  { city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'MYT', offset: 8},
  { city: 'Jakarta', country: 'Indonesia', timezone: 'WIB', offset: 7, latitude: -6.2088, longitude: 106.8456},
  { city: 'Dhaka', country: 'Bangladesh', timezone: 'BDT', offset: 6},
  { city: 'New Delhi', country: 'India', timezone: 'IST', offset: 5.5},
  { city: 'Karachi', country: 'Pakistan', timezone: 'PKT', offset: 5},
  { city: 'Dubai', country: 'UAE', timezone: 'GST', offset: 4},
  { city: 'Tehran', country: 'Iran', timezone: 'IRST', offset: 3.5},
  { city: 'Doha', country: 'Qatar', timezone: 'AST', offset: 3, latitude: 25.2854, longitude: 51.5310},
  { city: 'Moscow', country: 'Russia', timezone: 'MSK', offset: 3},
  { city: 'Makkah', country: 'SaudiArabia', timezone: 'AST', offset: 3},
  { city: 'Istanbul', country: 'Turkey', timezone: 'TRT', offset: 3},
  { city: 'Paris', country: 'France', timezone: 'CET', offset: 1},
  { city: 'London', country: 'UK', timezone: 'GMT', offset: 0},
  { city: 'Toronto', country: 'Canada', timezone: 'EST', offset: -5},
  { city: 'New York', country: 'USA', timezone: 'EST', offset: -5},
  { city: 'Austin', country: 'USA', timezone: 'CST', offset: -6},
  { city: 'San Francisco', country: 'USA', timezone: 'PST', offset: -8},
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

function findNextPrayerIndex(timings, cityTimezoneOffset, watchTimezoneOffset) {
  const now = new Date();
  
  // Calculate timezone difference (can be fractional for offsets like 5.5, 3.5)
  const timezoneDiff = cityTimezoneOffset - watchTimezoneOffset;
  
  // Get current time in watch timezone
  const watchHours = now.getHours();
  const watchMinutes = now.getMinutes();
  
  // Convert to city timezone (handle fractional offsets)
  const totalMinutes = watchHours * 60 + watchMinutes + (timezoneDiff * 60);
  let cityHours = Math.floor(totalMinutes / 60);
  let cityMinutes = Math.floor(totalMinutes % 60);
  
  // Handle day rollover
  if (cityHours < 0) {
    cityHours += 24;
  } else if (cityHours >= 24) {
    cityHours -= 24;
  }
  
  // Ensure minutes are non-negative
  if (cityMinutes < 0) {
    cityMinutes += 60;
    cityHours -= 1;
    if (cityHours < 0) cityHours += 24;
  }

  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Check each prayer in order
  for (let i = 0; i < prayerOrder.length; i++) {
    const prayerName = prayerOrder[i];
    const timeStr = timings[prayerName];
    if (!timeStr) continue;

    const timeOnly = timeStr.split(' ')[0];
    const [hours, minutes] = timeOnly.split(":").map(Number);

    if (hours > cityHours || (hours === cityHours && minutes > cityMinutes)) {
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
    let response;
    
    // For Jakarta and Doha, use coordinates API as they might not work with city name
    if (location.latitude && location.longitude) {
      const timestamp = Math.floor(Date.now() / 1000);
      console.log(`Fetching prayer times for: ${location.city} using coordinates (${location.latitude}, ${location.longitude})`);
      response = await fetch({
        url: `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${location.latitude}&longitude=${location.longitude}`,
        method: 'GET'
      });
    } else {
      // Remove spaces from city name for API call and encode for URL
      const cityForAPI = encodeURIComponent(location.city.replace(/\s+/g, ''));
      const countryForAPI = encodeURIComponent(location.country);
      console.log(`Fetching prayer times for: ${location.city}, ${location.country}`);
      console.log(`API URL: city=${cityForAPI}&country=${countryForAPI}`);
      response = await fetch({
        url: `https://api.aladhan.com/v1/timingsByCity?city=${cityForAPI}&country=${countryForAPI}`,
        method: 'GET'
      });
    }
    console.log(`Response code: ${response?.code}`);
    const resBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    console.log(`API status: ${resBody?.status}`);
    if (resBody?.status !== 'OK') {
      console.log(`API error response:`, JSON.stringify(resBody).substring(0, 300));
      throw new Error(`API returned status: ${resBody?.status || 'Unknown'}`);
    }
    if (!resBody.data || !resBody.data.timings) {
      console.log(`No timings data in response`);
      throw new Error('No timings data received from API');
    }
    const timings = resBody.data.timings;
    let result = [];
    if (timings) {
      // Get watch timezone offset for next prayer calculation
      const watchOffsetMinutes = new Date().getTimezoneOffset();
      const watchTimezoneOffset = -watchOffsetMinutes / 60;
      
      // Find which prayer is next (handles wrap-around: after Isha, Fajr is next)
      const nextPrayerIndex = findNextPrayerIndex(timings, location.offset, watchTimezoneOffset);
      
      const fajr = formatTime("Fajr", timings.Fajr, nextPrayerIndex === 0);
      const sunrise = formatTime("Sunrise", timings.Sunrise, nextPrayerIndex === 1);
      const dhuhr = formatTime("Dhuhr", timings.Dhuhr, nextPrayerIndex === 2);
      const asr = formatTime("Asr", timings.Asr, nextPrayerIndex === 3);
      const maghrib = formatTime("Maghrib", timings.Maghrib, nextPrayerIndex === 4);
      const isha = formatTime("Isha", timings.Isha, nextPrayerIndex === 5);
      result = [fajr, sunrise, dhuhr, asr, maghrib, isha];
    }
    // Get watch timezone offset (in hours from UTC)
    // JavaScript Date.getTimezoneOffset() returns offset in minutes, negative for ahead of UTC
    const watchOffsetMinutes = new Date().getTimezoneOffset();
    const watchTimezoneOffset = -watchOffsetMinutes / 60; // Convert to hours, negate because getTimezoneOffset is inverted
    
    res(null, {
      result,
      city: location.city,
      timezone: location.timezone,
      cityTimezoneOffset: location.offset,
      watchTimezoneOffset: watchTimezoneOffset,
    });
  } catch (error) {
    console.log("fetchPrayerTimes error:", error);
    res(null, {
      result: [],
      city: "Error fetching data",
      error: error.message || "Unknown error",
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
