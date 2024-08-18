async function saveError(statusCode,page,errorname) {
  if (statusCode != "200" && statusCode != "201") {
    await page.screenshot({
      path: `tests/screenshots/${errorname}-${Date.now()}.png`,
    });
  }
}

module.exports = {
  saveError,
};
