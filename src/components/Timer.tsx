import * as React from "react";

export default function Timer({
  timerExpired,
  remainMilisecond,
}: {
  remainMilisecond: number;
  timerExpired: () => void;
}) {
  const [minute, setMinute] = React.useState(
    Math.floor(remainMilisecond / (60 * 1000))
  );
  const [second, setSecond] = React.useState(
    Math.floor((remainMilisecond % (60 * 1000)) / 1000)
  );

  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecond((prev) => {
        if (prev === 0) {
          setMinute((p) => {
            if (p === 0) setExpired(true);
            return p - 1;
          });
          return 59;
        } else return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (expired) timerExpired();
  }, [expired]);

  return (
    <div>
      <span>
        {minute < 10 && "0"}
        {minute}
      </span>
      <span>:</span>
      <span>
        {second < 10 && "0"}
        {second}
      </span>
    </div>
  );
}
