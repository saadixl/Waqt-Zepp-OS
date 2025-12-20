import * as hmUI from "@zos/ui";
import { onKey, KEY_UP, KEY_DOWN, KEY_SELECT, KEY_EVENT_CLICK } from '@zos/interaction';
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
  FAJR_TEXT,
  SUNRISE_TEXT,
  DHUHR_TEXT,
  ASR_TEXT,
  MAGHRIB_TEXT,
  ISHA_TEXT,
  ACTIVE_TEXT,
  CENTER_MESSAGE_TEXT,
  PRAYER_TIMES_GENERIC_TEXT,
  ERROR_TEXT
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("fetch_api");
let centerMessageWidget, fajrWidget, sunriseWidget, dhuhrWidget, asrWidget, maghribWidget, ishaWidget;
let currentRequest = null;

function formatDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  return `${day} ${month} ${dayNum.toString().padStart(2, '0')} ${year}`;
}

function deleteAllWidgets() {
  if (centerMessageWidget) hmUI.deleteWidget(centerMessageWidget);
  if (fajrWidget) hmUI.deleteWidget(fajrWidget);
  if (sunriseWidget) hmUI.deleteWidget(sunriseWidget);
  if (dhuhrWidget) hmUI.deleteWidget(dhuhrWidget);
  if (asrWidget) hmUI.deleteWidget(asrWidget);
  if (maghribWidget) hmUI.deleteWidget(maghribWidget);
  if (ishaWidget) hmUI.deleteWidget(ishaWidget);
  centerMessageWidget = null;
  fajrWidget = null;
  sunriseWidget = null;
  dhuhrWidget = null;
  asrWidget = null;
  maghribWidget = null;
  ishaWidget = null;
}

Page(
  BasePage({
    state: {},
    build() {
      onKey({
        callback: (key, keyEvent) => {
          if (keyEvent === KEY_EVENT_CLICK) {
            if (key === KEY_SELECT) {
              this.fetchData('');
            } else if (key === KEY_UP) {
              this.fetchData('UP');
            } else if (key === KEY_DOWN) {
              this.fetchData('DOWN');
            }
          } else {
            zepos.defaultOnKey(key, context);
          }
        },
      });

      setTimeout(() => {
        this.fetchData('');
      }, 10);
    },
    showLoading() {
      deleteAllWidgets();
      centerMessageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CENTER_MESSAGE_TEXT,
        text: "Loading...",
      });
    },
    renderPrayerTimeItem(ptStyle, nextStyle, result) {
      return hmUI.createWidget(hmUI.widget.TEXT, {
        ...PRAYER_TIMES_GENERIC_TEXT,
        ...ptStyle,
        ...nextStyle ? ACTIVE_TEXT : {},
        text: `${result.title}\n${result.time}`,
      });
    },
    fetchData(action) {
      // Cancel any pending request
      if (currentRequest) {
        // Note: BasePage request might not support cancellation, but we can track it
        currentRequest = null;
      }
      
      this.showLoading();
      currentRequest = this.request({
        method: "GET_DATA",
        params: {
          action
        }
      });
      
      currentRequest
        .then((data) => {
          // Only process if this is still the current request
          if (currentRequest === null) return;
          
          logger.log("receive data");
          // Delete all existing widgets before creating new ones
          deleteAllWidgets();
          
          const { result = [], city } = data;
          centerMessageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
            ...CENTER_MESSAGE_TEXT,
            text: `${formatDate(new Date())}\n${city}`,
          });
          if (!result.length) {
            if (centerMessageWidget) hmUI.deleteWidget(centerMessageWidget);
            centerMessageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...CENTER_MESSAGE_TEXT,
              ...ERROR_TEXT,
              text: "Something went wrong!",
            });
          } else {
            const isFajrNext = result[0].isUpcoming;
            const isDhuhrNext = !isFajrNext && result[2].isUpcoming;
            const isAsrNext = !isFajrNext && !isDhuhrNext && result[3].isUpcoming;
            const isMaghribNext = !isFajrNext && !isDhuhrNext && !isAsrNext && result[4].isUpcoming;
            const isIshaNext = !isFajrNext && !isDhuhrNext && !isAsrNext && !isMaghribNext && result[5].isUpcoming;
            fajrWidget = this.renderPrayerTimeItem(FAJR_TEXT, isFajrNext, result[0]);
            sunriseWidget = this.renderPrayerTimeItem(SUNRISE_TEXT, false, result[1]);
            dhuhrWidget = this.renderPrayerTimeItem(DHUHR_TEXT, isDhuhrNext, result[2]);
            asrWidget = this.renderPrayerTimeItem(ASR_TEXT, isAsrNext, result[3]);
            maghribWidget = this.renderPrayerTimeItem(MAGHRIB_TEXT, isMaghribNext, result[4]);
            ishaWidget = this.renderPrayerTimeItem(ISHA_TEXT, isIshaNext, result[5]);
          }
          currentRequest = null;
        })
        .catch((err) => {
          currentRequest = null;
          logger.error("fetchData error:", err);
        });
    },
    destroy() {
      // Cancel any pending request
      currentRequest = null;
      // Clean up all widgets when page is destroyed
      deleteAllWidgets();
    },
  })
);
