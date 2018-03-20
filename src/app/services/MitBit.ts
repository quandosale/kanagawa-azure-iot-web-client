export class MitBit {
    static buffer12ToArray(buf) {
        const arr_ecg = [];
        for (let i = 0; i < buf.length / 3; i++) {
            const byte1 = buf[i * 3 + 0];
            const byte2 = buf[i * 3 + 1];
            const byte3 = buf[i * 3 + 2];
            // console.log('byte1', byte1, (byte2 & 0x0F) << 8);
            const first = (byte1 & 0xFF) + ((byte2 & 0x0F) << 8);
            const second = (byte3 & 0xFF) + (((byte2 & 0xF0) >> 4) << 8);

            arr_ecg.push(first);
            arr_ecg.push(second);
        }
        return arr_ecg;
    }
}