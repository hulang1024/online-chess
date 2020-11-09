export default function formatTime(time: Date) {
    const pad = (n: number) => n > 9 ? n : '0' + n;
    return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
}