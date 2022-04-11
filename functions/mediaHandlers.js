const fs = require("fs");
const mime = require("mime-types");
const gm = require("gm").subClass({ imageMagick: true });

const { sendReply } = require("./venomFunctions");

const ocrConfig = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

module.exports.stkToImg = (client, msgType, sendIn, replyTo) => {
  if (msgType === "sticker") {
    console.log("image from sticker requested");
    sendReply(
      client,
      sendIn,
      "This feature has not been implemented yet.\nThe developer will complete it when he feels like it.\nUntil then, bear with it.",
      replyTo,
      "Error when sending warning: "
    );
  } else {
    sendReply(
      client,
      sendIn,
      "The selected message is not a sticker",
      replyTo,
      "Error when sending warning: "
    );
  }
};

module.exports.imgToSticker = async (client, sendIn, replyTo, msgObj) => {
  if (msgObj.type !== "image") {
    sendReply(
      client,
      sendIn,
      "The selected message is not an image",
      replyTo,
      "Error when sending warning: "
    );
    return;
  }

  const buffer = await client.decryptFile(msgObj);
  console.log("Buffer generated");
  let fileName = `some-file-name.${mime.extension(msgObj.mimetype)}`;
  fs.writeFile(fileName, buffer, (err) => {
    if (err) {
      sendReply(
        client,
        sendIn,
        "There was a problem while downloading the image\nTry again",
        replyTo,
        "Error when sending sticker progress: "
      );
      return;
    }
    gm(fileName)
      .resizeExact(500, 500)
      .gravity("Center")
      .write(fileName, function (err) {
        if (err) {
          sendReply(
            client,
            sendIn,
            "Image editing failed😞\n\nTry Again",
            replyTo,
            "Error when sending sticker progress: "
          );
          return;
        }
        client
          .sendImageAsSticker(sendIn, fileName)
          .then(() => {
            console.log("Sticker sent\n-------------------------\n");
          })
          .catch((erro) => {
            console.error("Error when sending sticker: \n", erro);
            sendReply(
              client,
              sendIn,
              "Sending sticker failed😞\n\nTry again",
              replyTo,
              "Error when sending sticker error: "
            );
          });
      });
  });
};

module.exports.ocr = async (client, sendIn, replyTo, msgObj) => {
  if (msgObj.type !== "image") {
    sendReply(
      client,
      sendIn,
      "The selected message is not an image",
      replyTo,
      "Error when sending warning: "
    );
    return;
  }

  const buffer = await client.decryptFile(msgObj);
  console.log("Buffer generated");
  let filename = `some-file-name.jpg`;
  fs.writeFile(filename, buffer, async (err) => {
    if (err) throw err;
    console.log("File write successful");
    console.log(`${__dirname}/${filename}`);

    tesseract
      .recognize(`${__dirname}/${filename}`, ocrConfig)
      .then((text) => {
        console.log("Result:", text);
        sendReply(
          message.chatId,
          "Text recognised through OCR:",
          message.id.toString(),
          "Error when sending ocr: "
        );
        sendReply(
          message.chatId,
          text,
          message.id.toString(),
          "Error when sending ocr: "
        );
        ocrConfig.lang = "eng";
      })
      .catch((error) => {
        console.log("ERROR");
        console.log(error.message);
        sendReply(
          message.chatId,
          "Text not found",
          message.id.toString(),
          "Error when sending ocr failure: "
        );
        ocrConfig.lang = "eng";
      });
  });
};
