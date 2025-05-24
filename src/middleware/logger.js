const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);

  // Log request details
  console.log("\n=== Incoming Request ===");
  console.log("Time:", timestamp);
  console.log("Request ID:", requestId);
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", {
    "content-type": req.headers["content-type"],
    "user-agent": req.headers["user-agent"],
  });

  // Store requestId for error tracking
  req.requestId = requestId;

  // Log response
  const originalSend = res.send;
  res.send = function (body) {
    console.log("\n=== Response ===");
    console.log("Request ID:", requestId);
    console.log("Status:", res.statusCode);
    console.log("Time:", new Date().toISOString());
    if (typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        console.log("Response Body:", {
          ...parsed,
          // Mask sensitive data
          data: parsed.data
            ? {
                ...parsed.data,
                phone_number: parsed.data.phone_number
                  ? "****" + parsed.data.phone_number.slice(-4)
                  : undefined,
              }
            : undefined,
        });
      } catch (e) {
        console.log(
          "Response Body:",
          body.substring(0, 100) + (body.length > 100 ? "..." : "")
        );
      }
    } else {
      console.log("Response Body:", body);
    }
    console.log("=== End Request ===\n");
    originalSend.apply(res, arguments);
  };

  next();
};

export default requestLogger;
