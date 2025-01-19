import { BaseSideService } from "@zeppos/zml/base-side";
import moment from "moment";

function isTimeAfterNow(givenTime) {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const [givenHours, givenMinutes] = givenTime.split(":").map(Number);
  if (givenHours > currentHours) {
    return true;
  } else if (givenHours === currentHours) {
    return givenMinutes > currentMinutes;
  } else {
    return false;
  }
}

function formatTime(title, time) {
  return {
    title,
    isUpcoming: isTimeAfterNow(time),
    time: moment(time, "h:mm a").format("h:mm a"),
  };
}

async function fetchPrayerTimes(res) {
  try {
    const response = await fetch({
      url: 'https://api.aladhan.com/v1/timingsByCity?city=Singapore&country=Singapore',
      method: 'GET'
    })
    const resBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
    const timings = resBody.status === 'OK' ? resBody.data.timings : null;
    let result = [];
    if (timings) {
      const fajr = formatTime("Fajr", timings.Fajr);
      const sunrise = formatTime("Sunrise", timings.Sunrise);
      const dhuhr = formatTime("Dhuhr", timings.Dhuhr);
      const asr = formatTime("Asr", timings.Asr);
      const maghrib = formatTime("Maghrib", timings.Maghrib);
      const isha = formatTime("Isha", timings.Isha);
      result = [fajr, sunrise, dhuhr, asr, maghrib, isha];
    }
    res(null, {
      result,
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
        fetchPrayerTimes(res);
      }
    },

    onRun() { },

    onDestroy() { },
  })
);
