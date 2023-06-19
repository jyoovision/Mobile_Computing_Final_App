const relativeTime = (past) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = new Date() - past;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + "초 전";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + "분 전";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + "시간 전";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + "일 전";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + "달 전";
  } else {
    return Math.round(elapsed / msPerYear) + "년 전";
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0 based, add 1 and pad with 0
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
};

const formatMonthDay = (date) => {
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0 based, add 1 and pad with 0
  const day = ("0" + date.getDate()).slice(-2);
  return `${month}/${day}`;
};

export { relativeTime, formatDate, formatMonthDay };
