import * as hmUI from "@zos/ui";
import moment from "moment";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
  FETCH_BUTTON,
  APP_HEADER_TEXT,
  FAJR_TEXT,
  SUNRISE_TEXT,
  DHUHR_TEXT,
  ASR_TEXT,
  MAGHRIB_TEXT,
  ISHA_TEXT,
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("fetch_api");

Page(
  BasePage({
    state: {},
    build() {
      hmUI.createWidget(hmUI.widget.TEXT, {
        ...APP_HEADER_TEXT,
        text: `Singapore\n${moment().format('ddd MMM DD YYYY')}`,
      });
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FETCH_BUTTON,
        click_func: (button_widget) => {
          logger.log("click button");
          this.fetchData();
        },
      });
    },
    fetchData() {
      this.request({
        method: "GET_DATA",
      })
        .then((data) => {
          logger.log("receive data");
          const { result = [] } = data;
          //const text = JSON.stringify(result);
          if (!result.length) {
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...FAJR_TEXT,
              text: "Please refresh to see prayer times.",
            });
          } else {
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...FAJR_TEXT,
              text: `${result[0].title}\n${result[0].time}`,
            });
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...SUNRISE_TEXT,
              text: `${result[1].title}\n${result[1].time}`,
            });
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...DHUHR_TEXT,
              text: `${result[2].title}\n${result[2].time}`,
            });
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...ASR_TEXT,
              text: `${result[3].title}\n${result[3].time}`,
            });
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...MAGHRIB_TEXT,
              text: `${result[4].title}\n${result[4].time}`,
            });
            hmUI.createWidget(hmUI.widget.TEXT, {
              ...ISHA_TEXT,
              text: `${result[5].title}\n${result[5].time}`,
            });
          }
        })
        .catch((res) => { });
    },
  })
);
