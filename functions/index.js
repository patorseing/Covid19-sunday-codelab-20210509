const admin = require("firebase-admin");
admin.initializeApp();

const functions = require("firebase-functions");
const axios = require("axios");
const cheerio = require("cheerio");

exports.covid19 = functions.pubsub
  .schedule("* * * * *")
  .timeZone("Asia/Bangkok")
  .onRun(async (context) => {
exports.covid19 = functions.https.onRequest(async (data, context) => {
  const response = await axios.get("https://covid19.ddc.moph.go.th/th");
  const html = response.data;
  const $ = cheerio.load(html);

  const selector = $(".block-st-all h1");
  if (selector.length !== 4) {
    return null;
  }

  let current = "";
  selector.each((index, element) => {
    if (index === 0) {
      current = $(element).text();
    } else {
      current = current.concat("|", $(element).text());
    }
  });

  let last = await admin.firestore().doc("line/covid19").get();
  if (!last.exists || last.data().report !== current) {
    await admin.firestore().doc("line/covid19").set({ report: current });
    broadcast(current);
  }

  return null;
});

const TOKEN="RKinPHsxa8FQFRWDLvT3h46SS4824s3xBz8NdKS7b1j9fIxvo8eh3ssj/qDWbu8P/MoUrD27WQ8COhaQXZFwXxMVGe1c0acdK5OVlwL/N2MBOKIhCAbCqZW2QPr5TIn1mUG1Ql1rnXQCAby/eQtq6AdB04t89/1O/w1cDnyilFU="

const broadcast = (current) => {
  const currents = current.split("|");
  return axios({
    method: "post",
    url: "https://api.line.me/v2/bot/message/broadcast",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    data: JSON.stringify({
      messages: [
        {
          type: "flex",
          altText: "รายงานสถานการณ์ โควิด-19",
          contents: {
            type: "bubble",
            size: "giga",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "ติดเชื้อสะสม",
                  color: "#ffffff",
                  size: "xl",
                  margin: "md",
                },
                {
                  type: "text",
                  text: currents[0],
                  color: "#ffffff",
                  size: "4xl",
                  weight: "bold",
                  margin: "md",
                },
              ],
              justifyContent: "center",
              alignItems: "center",
            },
            body: {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "หายแล้ว",
                      color: "#ffffff",
                      size: "sm",
                      margin: "md",
                    },
                    {
                      type: "text",
                      text: currents[1],
                      color: "#ffffff",
                      size: "lg",
                      weight: "bold",
                      margin: "md",
                    },
                  ],
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#046034",
                  cornerRadius: "md",
                  margin: "md",
                  spacing: "md",
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "รักษาอยู่ใน รพ.",
                      color: "#ffffff",
                      size: "sm",
                      margin: "md",
                    },
                    {
                      type: "text",
                      text: currents[2],
                      color: "#ffffff",
                      size: "lg",
                      weight: "bold",
                      margin: "md",
                    },
                  ],
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#179c9b",
                  cornerRadius: "md",
                  margin: "md",
                  spacing: "md",
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "เสียชีวิต",
                      color: "#ffffff",
                      size: "sm",
                      margin: "md",
                    },
                    {
                      type: "text",
                      text: currents[3],
                      color: "#ffffff",
                      size: "lg",
                      weight: "bold",
                      margin: "md",
                    },
                  ],
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#666666",
                  cornerRadius: "md",
                  margin: "md",
                  spacing: "md",
                },
              ],
            },
            styles: {
              header: {
                backgroundColor: "#e1298e",
                separator: true,
              },
            },
          },
        },
      ],
    }),
  });
};
