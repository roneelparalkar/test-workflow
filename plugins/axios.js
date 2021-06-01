export default function({ $axios, $winstonLog, redirect }) {
  $axios.onRequest(config => {
    if (process.env.NODE_ENV !== "production") config.requestStartedAt = Date.now();
  });

  $axios.onResponse(resp => {
    if (process.env.NODE_ENV !== "production") {
      $winstonLog.http({
        location: "axios-plugin",
        api: resp.config.url,
        rT: `${Date.now() - resp.config.requestStartedAt}ms`
      });
      // $winstonLog.info(
      //   JSON.stringify({
      //     location: "axios-plugin-response-header",
      //     data: JSON.stringify(resp.headers)
      //   })
      // );
    }
  });

  $axios.onError(error => {
    $winstonLog.error({
      location: "axios-plugin",
      api: error && error.config ? error.config.url : "",
      error: true
    });
  });
}
