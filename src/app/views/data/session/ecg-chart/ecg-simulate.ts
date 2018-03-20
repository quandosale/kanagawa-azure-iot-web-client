export class EcgSimulator {
    x = 0;
    getECG(): number {
        var li = 30 / 72;

        var a_pwav = 0.25;
        var d_pwav = 0.09;
        var t_pwav = 0.16;

        var a_qwav = 0.025;
        var d_qwav = 0.066;
        var t_qwav = 0.166;

        var a_qrswav = 1.6;
        var d_qrswav = 0.11;

        var a_swav = 0.25;
        var d_swav = 0.066;
        var t_swav = 0.09;

        var a_twav = 0.35;
        var d_twav = 0.142;
        var t_twav = 0.2;

        var a_uwav = 0.035;
        var d_uwav = 0.0476;
        var t_uwav = 0.433;
        var pwav = this.p_wav(this.x, a_pwav, d_pwav, t_pwav, li);

        // %qwav output
        var qwav = this.q_wav(this.x, a_qwav, d_qwav, t_qwav, li);
        // %qrswav output
        var qrswav = this.qrs_wav(this.x, a_qrswav, d_qrswav, li);
        // %swav output
        var swav = this.s_wav(this.x, a_swav, d_swav, t_swav, li);
        // %twav output
        var twav = this.t_wav(this.x, a_twav, d_twav, t_twav, li);
        // %uwav output
        var uwav = this.u_wav(this.x, a_uwav, d_uwav, t_uwav, li);
        // %ecg output
        var ecg = pwav + qrswav + twav + swav + qwav + uwav;

        this.x += 0.01;
        return ecg * 2000;
    }
    p_wav(x: number, a_pwav: number, d_pwav: number, t_pwav: number, li: number): number {
        var l = li;
        var a = a_pwav;
        x = x + t_pwav;
        var b = (2 * l) / d_pwav;
        var n = 100;
        var p1 = 1 / l;
        var p2 = 0;
        var harm1 = 0;
        for (var i = 1; i < n; i++) {
            harm1 = (((Math.sin((Math.PI / (2 * b)) * (b - (2 * i)))) / (b - (2 * i)) + (Math.sin((Math.PI / (2 * b)) * (b + (2 * i)))) / (b + (2 * i))) * (2 / Math.PI)) * Math.cos((i * Math.PI * x) / l);
            p2 = p2 + harm1;
        }

        var pwav1 = p1 + p2;
        var pwav = a * pwav1;

        return pwav;
    }
    q_wav(x: number, a_qwav: number, d_qwav: number, t_qwav: number, li: number): number {
        var l = li;
        x = x + t_qwav;
        var a = a_qwav;
        var b = (2 * l) / d_qwav;
        var n = 100;
        var q1 = (a / (2 * b)) * (2 - b);
        var q2 = 0;
        var harm5 = 0;
        for (var i = 1; i < n; i++) {
            harm5 = (((2 * b * a) / (i * i * Math.PI * Math.PI)) * (1 - Math.cos((i * Math.PI) / b))) * Math.cos((i * Math.PI * x) / l);
            q2 = q2 + harm5;
        }
        var qwav = -1 * (q1 + q2);
        return qwav;
    }
    // %qrswav output
    qrs_wav(x: number, a_qrswav: number, d_qrswav: number, li: number): number {
        var l = li;
        var a = a_qrswav;
        var b = (2 * l) / d_qrswav;
        var n = 100;
        var qrs1 = (a / (2 * b)) * (2 - b);
        var qrs2 = 0;
        var harm = 0;
        for (var i = 1; i < n; i++) {
            harm = (((2 * b * a) / (i * i * Math.PI * Math.PI)) * (1 - Math.cos((i * Math.PI) / b))) * Math.cos((i * Math.PI * x) / l);
            qrs2 = qrs2 + harm;
        }
        var qrswav = qrs1 + qrs2;
        return qrswav;
    }
    // %swav output
    s_wav(x: number, a_swav: number, d_swav: number, t_swav: number, li: number): number {
        var l = li;
        x = x - t_swav;
        var a = a_swav;
        var b = (2 * l) / d_swav;
        var n = 100;
        var s1 = (a / (2 * b)) * (2 - b);
        var s2 = 0;
        var harm3 = 0;
        for (var i = 1; i < n; i++) {
            harm3 = (((2 * b * a) / (i * i * Math.PI * Math.PI)) * (1 - Math.cos((i * Math.PI) / b))) * Math.cos((i * Math.PI * x) / l);
            s2 = s2 + harm3;
        }
        var swav = -1 * (s1 + s2);
        return swav;
    }
    // %twav output
    t_wav(x: number, a_twav: number, d_twav: number, t_twav: number, li: number): number {
        let l = li;
        var a = a_twav;
        x = x - t_twav - 0.045;
        var b = (2 * l) / d_twav;
        var n = 100;
        var t1 = 1 / l;
        var t2 = 0;
        var harm2 = 0;
        for (var i = 1; i < n; i++) {
            harm2 = (((Math.sin((Math.PI / (2 * b)) * (b - (2 * i)))) / (b - (2 * i)) + (Math.sin((Math.PI / (2 * b)) * (b + (2 * i)))) / (b + (2 * i))) * (2 / Math.PI)) * Math.cos((i * Math.PI * x) / l);
            t2 = t2 + harm2;
        }
        const twav1 = t1 + t2;
        var twav = a * twav1;
        return twav;

    }
    // %uwav output
    u_wav(x: number, a_uwav: number, d_uwav: number, t_uwav: number, li: number): number {
        var l = li;
        var a = a_uwav;
        x = x - t_uwav;
        var b = (2 * l) / d_uwav;
        const n = 100;
        const u1 = 1 / l;
        let u2 = 1;
        let harm4 = 0;
        for (let i = 1; i < n; i++) {
            harm4 = (((Math.sin((Math.PI / (2 * b)) * (b - (2 * i)))) / (b - (2 * i)) + (Math.sin((Math.PI / (2 * b)) * (b + (2 * i)))) / (b + (2 * i))) * (2 / Math.PI)) * Math.cos((i * Math.PI * x) / l);
            u2 = u2 + harm4;
        }
        const uwav1 = u1 + u2;
        const uwav = a * uwav1;
        return uwav;

    }
}
