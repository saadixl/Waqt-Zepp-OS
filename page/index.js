import * as hmUI from "@zos/ui";
import { onKey, KEY_UP, KEY_DOWN, KEY_SELECT, KEY_EVENT_CLICK } from '@zos/interaction';
import moment from "moment";
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
      hmUI.deleteWidget(centerMessageWidget);
      hmUI.deleteWidget(fajrWidget);
      hmUI.deleteWidget(sunriseWidget);
      hmUI.deleteWidget(dhuhrWidget);
      hmUI.deleteWidget(asrWidget);
      hmUI.deleteWidget(maghribWidget);
      hmUI.deleteWidget(ishaWidget);
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
      this.showLoading();
      this.request({
        method: "GET_DATA",
        params: {
          action
        }
      })
        .then((data) => {
          logger.log("receive data");
          hmUI.deleteWidget(centerMessageWidget);
          const { result = [], city } = data;
          centerMessageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
            ...CENTER_MESSAGE_TEXT,
            text: `${moment().format('ddd MMM DD YYYY')}\n${city}`,
          });
          if (!result.length) {
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
            sunriseWidget = this.renderPrayerTimeItem(SUNRISE_TEXT, {}, result[1]);
            dhuhrWidget = this.renderPrayerTimeItem(DHUHR_TEXT, isDhuhrNext, result[2]);
            asrWidget = this.renderPrayerTimeItem(ASR_TEXT, isAsrNext, result[3]);
            maghribWidget = this.renderPrayerTimeItem(MAGHRIB_TEXT, isMaghribNext, result[4]);
            ishaWidget = this.renderPrayerTimeItem(ISHA_TEXT, isIshaNext, result[5]);
          }
        })
        .catch((res) => { });
    },
  })
);
