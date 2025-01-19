import * as hmUI from "@zos/ui";
import { onKey, KEY_UP, KEY_DOWN, KEY_EVENT_CLICK } from '@zos/interaction';
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
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("fetch_api");
let centerMessageWidget, fajrWidget, sunriseWidget, dhuhrWidget, asrWidget, maghribWidget, ishaWidget;

Page(
  BasePage({
    state: {},
    build() {
      onKey({
        callback: (key, keyEvent) => {
          if ((key === KEY_UP || key === KEY_DOWN) && keyEvent === KEY_EVENT_CLICK) {
            this.fetchData();
          } else {
            zepos.defaultOnKey(key, context);
          }
        },
      });

      setTimeout(() => {
        this.fetchData();
      }, 10);
    },
    fetchData() {
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
      this.request({
        method: "GET_DATA",
      })
        .then((data) => {
          logger.log("receive data");
          hmUI.deleteWidget(centerMessageWidget);
          centerMessageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
            ...CENTER_MESSAGE_TEXT,
            text: `${moment().format('ddd MMM DD YYYY')}\nSingapore`,
          });
          const { result = [] } = data;
          //const text = JSON.stringify(result);
          if (!result.length) {
            centerMessageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...CENTER_MESSAGE_TEXT,
              ...ERROR_COLOR,
              text: "Something went wrong!",
            });
          } else {
            const isFajrNext = result[0].isUpcoming;
            const isDhuhrNext = !isFajrNext && result[2].isUpcoming;
            const isAsrNext = !isFajrNext && !isDhuhrNext && result[3].isUpcoming;
            const isMaghribNext = !isFajrNext && !isDhuhrNext && !isAsrNext && result[4].isUpcoming;
            const isIshaNext = !isFajrNext && !isDhuhrNext && !isAsrNext && !isMaghribNext && result[5].isUpcoming;

            fajrWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...FAJR_TEXT,
              ...isFajrNext ? ACTIVE_TEXT : {},
              text: `${result[0].title}\n${result[0].time}`,
            });
            sunriseWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...SUNRISE_TEXT,
              text: `${result[1].title}\n${result[1].time}`,
            });
            dhuhrWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...DHUHR_TEXT,
              ...isDhuhrNext ? ACTIVE_TEXT : {},
              text: `${result[2].title}\n${result[2].time}`,
            });
            asrWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...ASR_TEXT,
              ...isAsrNext ? ACTIVE_TEXT : {},
              text: `${result[3].title}\n${result[3].time}`,
            });
            maghribWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...MAGHRIB_TEXT,
              ...isMaghribNext ? ACTIVE_TEXT : {},
              text: `${result[4].title}\n${result[4].time}`,
            });
            ishaWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...ISHA_TEXT,
              ...isIshaNext ? ACTIVE_TEXT : {},
              text: `${result[5].title}\n${result[5].time}`,
            });
          }
        })
        .catch((res) => { });
    },
  })
);
