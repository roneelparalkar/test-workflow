const SIClass = class {

    constructor(startDate, expiredDate, onRender, onComplete) {
        this.timeRemaining = "";
        this.setExpiredDate(expiredDate, startDate);
        this.onRender = onRender;
        this.onComplete = onComplete;
    }
    setEventActiveState(startDate, expiredDate) {
        // get the current time
        const currentTime = new Date().getTime();
        const startTime = startDate.getTime();
        const endTime = expiredDate.getTime();
        return currentTime > startTime && currentTime < endTime;

    }
    setExpiredDate(expiredDate, startDate) {
        // get the current time
        const currentTime = new Date().getTime();
        const startTime = startDate.getTime();
        // calculate the remaining time 
        this.timeRemaining = expiredDate.getTime() - currentTime;
        this.setEventActiveState(startDate, expiredDate) ? this.timeRemaining > 0 ?
            this.start() :
            this.complete() : this.complete();
    }


    complete() {
        if (typeof this.onComplete === 'function') {
            this.onComplete();
        }
    }
    getTime() {
        let days = Math.floor(this.timeRemaining / 1000 / 60 / 60 / 24),
            hours = Math.floor(this.timeRemaining / 1000 / 60 / 60),
            minutes = Math.floor(this.timeRemaining / 1000 / 60) % 60,
            seconds = Math.floor(this.timeRemaining / 1000) % 60;
        return {
            days: days.toString().length == 1 ? '0' + days : days,
            hours: hours.toString().length == 1 ? '0' + hours : hours,
            minutes: minutes.toString().length == 1 ? '0' + minutes : minutes,
            seconds: seconds.toString().length == 1 ? '0' + seconds : seconds,
        };
    }

    update() {
        if (typeof this.onRender === 'function') {
            this.onRender(this.getTime());
        }
    }

    start() {
        // update the countdown
        this.update();

        //  setup a timer
        const intervalId = setInterval(() => {
            // update the timer  
            this.timeRemaining -= 1000;

            if (this.timeRemaining < 0) {
                // call the callback
                this.complete();

                // clear the interval if expired
                clearInterval(intervalId);
            } else {
                this.update();
            }

        }, 1000);
    }
}
window.SIWidget = !window.SIWidget ? {}:window.SIWidget;
window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["CountDown"] = SIClass;