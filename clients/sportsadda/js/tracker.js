import render from "./../../../components/si-tracker/widget-layout-01.vue";
const { trackerDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");
const SIClass = class {
  constructor(config, VueLib, widgetConfig, commonFunctions) {
    this.config = config;
    this.Vue = VueLib;
    this.widgetConfig = widgetConfig;
    this.selectedLang = "en";
    this.commonFunctions = commonFunctions;
    this.seriesId = widgetConfig.container.getAttribute("data-series");
    this.extraClass = widgetConfig.container.getAttribute("extra-class");
    this.imagePaths = config.imagePaths;
  }
  init() {
    this.hydration();
  }
  getWidgetData() {
    let promiseArray = [];
    let responseData = {};

    for (let keys in this.widgetConfig.apis) {
      let requestUrl = this.widgetConfig.apis[keys].replace("{{SERIESID}}", this.seriesId);

      let promiseData = this.commonFunctions
        .apiCall(requestUrl, { isJSON: true })
        .then(response => {
          return (responseData[keys] = response);
        })
        .catch(err => {
          console.log(err);
        });
      promiseArray.push(promiseData);
    }
    return new Promise((resolve, reject) => {
      Promise.all(promiseArray).then(data => {
        return resolve(responseData);
      });
    });
  }
  mountMarkup(data) {
    // let clientCache = {
    //   customNames: { en: window.SIWidget.customNames },
    //   translations: { en: window.SIWidget.translations }
    // };

    let fullData = trackerDataParser(data.apis);
    let widgetData = fullData.data;
    widgetData.seriesId = this.seriesId;
    widgetData.extraClass = this.extraClass;
    this.widgetConfig.container.innerHTML = "";
    let vueInstance = new Vue(render);
    vueInstance.widgetData = widgetData;
    let { polarAreaChartData } = fullData;
    vueInstance.imagePaths = this.imagePaths;
    vueInstance.$mount(this.widgetConfig.container);
    // this.loadGliderCss();
    new Glider(document.querySelector(".glider-extras"), {
      slidesToShow: 1,
      dots: ".dots-extras"
      // skipTrack: true,
      // draggable: true
    });
    new Glider(document.querySelector(".glider-outs"), {
      slidesToShow: 1,
      dots: ".dots-outs"
      // skipTrack: true,
      // draggable: true
    });

    if (document.querySelectorAll(".glider-track") && document.querySelectorAll(".glider-track").length) {
      Array.from(document.querySelectorAll(".glider-track")).forEach(elem => {
        elem.style.width = "";
      });

      window.onresize = () => {
        Array.from(document.querySelectorAll(".glider-track")).forEach(elem => {
          elem.style.width = "";
        });
      };
    }

    window.loadJS("/static-assets/build/js/raphael.min.js", () => {
      this.pieDraw(polarAreaChartData);
    });
    return;
  }
  // loadGliderCss() {
  // var head = document.getElementsByTagName("head")[0];
  // var link = document.createElement("style");
  // head.appendChild(link);
  // }
  // loadRaphael(vueInstance) {
  //   let raphaelUrl;
  //   this.widgetConfig.dependencies.find(dependency => {
  //     if (dependency.name === "Raphael") {
  //       raphaelUrl = dependency.url;
  //       return true;
  //     }
  //   });
  //   this.commonFunctions.loadJsFile(raphaelUrl).then(() => {
  //     this.pieDraw(vueInstance.polarAreaChartData);
  //   });
  // }
  hydration() {
    this.getWidgetData()
      .then(resp => {
        let widgetData = { apis: {} };
        widgetData.apis.trackerData = resp.trackerData;
        this.mountMarkup(widgetData);
      })
      .catch(function(err) {
        console.log("Error while hydration", err);
      });
  }
  pieDraw(polarAreaChartData) {
    var labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

    Raphael.fn.pieChart = function(cx, cy, r, values, labels, stroke) {
      var paper = this,
        rad = Math.PI / 180,
        chart = this.set();
      function sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
          x2 = cx + r * Math.cos(-endAngle * rad),
          y1 = cy + r * Math.sin(-startAngle * rad),
          y2 = cy + r * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
      }
      var angle = 0,
        total = 0,
        maxVal = 0,
        start = 0,
        process = function(j) {
          var value = values[j].value,
            angleplus = 360 / values.length, //360 * value / total,
            popangle = angle + angleplus / 2,
            color = Raphael.hsb(start, 0.75, 1),
            ms = 500,
            delta = 30,
            bcolor = Raphael.hsb(start, 1, 1),
            p = sector(cx, cy, r, angle, angle + angleplus, { fill: values[j].color, stroke: stroke, "stroke-width": 0 }),
            txt = paper
              .text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 25) * Math.sin(-popangle * rad), labels[j])
              .attr({ fill: bcolor, stroke: "none", opacity: 0, "font-size": 20 });

          var st = values[j].value / maxVal;
          p.transform(["...S", st, st, cx, cy]);

          angle += angleplus;
          chart.push(p);
          chart.push(txt);
          start += 0.1;
        };

      for (var i = 0; i < values.length; i++) {
        //total += values[i];
        if (maxVal < values[i].value) maxVal = values[i].value;
      }
      maxVal = maxVal * 2;
      for (i = 0; i < values.length; i++) {
        process(i);
      }
      chart.transform(["...S", -1, 1, cx, cy, "R", -90, cx, cy, "S", 0.1, 0.1, cx, cy]);
      chart.animate({ transform: "...S10,10 " + cx + " " + cy }, 500);

      return chart;
    };

    if (window.innerWidth <= 767 && window.innerWidth >= 321) {
      Raphael("wagon_wheel_container", 260, 213).pieChart(150, 152, 144, polarAreaChartData, labels, "ffff");
    } else {
      Raphael("wagon_wheel_container", 440, 360).pieChart(199, 180, 196, polarAreaChartData, labels, "ffff");
    }
  }
};
window.SIWidget.SIClass = window.SIWidget.SIClass || {};
window.SIWidget.SIClass["tracker"] = SIClass;

!(function(e) {
  "function" == typeof define && define.amd ? define(e) : "object" == typeof exports ? (module.exports = e()) : e();
})(function() {
  var n = "undefined" != typeof window ? window : this,
    e = (n.Glider = function(e, t) {
      var i = this;
      if (e._glider) return e._glider;
      if (
        ((i.ele = e),
        i.ele.classList.add("glider"),
        ((i.ele._glider = i).opt = Object.assign(
          {},
          {
            slidesToScroll: 1,
            slidesToShow: 1,
            resizeLock: !0,
            duration: 0.5,
            easing: function(e, t, i, o, r) {
              return o * (t /= r) * t + i;
            }
          },
          t
        )),
        (i.animate_id = i.page = i.slide = 0),
        (i.arrows = {}),
        (i._opt = i.opt),
        i.opt.skipTrack)
      )
        i.track = i.ele.children[0];
      else
        for (i.track = document.createElement("div"), i.ele.appendChild(i.track); 1 !== i.ele.children.length; )
          i.track.appendChild(i.ele.children[0]);
      i.track.classList.add("glider-track"),
        i.init(),
        (i.resize = i.init.bind(i, !0)),
        i.event(i.ele, "add", { scroll: i.updateControls.bind(i) }),
        i.event(n, "add", { resize: i.resize });
    }),
    t = e.prototype;
  return (
    (t.init = function(e, t) {
      var i = this,
        o = 0,
        r = 0;
      (i.slides = i.track.children),
        [].forEach.call(i.slides, function(e, t) {
          e.classList.add("glider-slide"), e.setAttribute("data-gslide", t);
        }),
        (i.containerWidth = i.ele.clientWidth);
      var s = i.settingsBreakpoint();
      if (((t = t || s), "auto" === i.opt.slidesToShow || void 0 !== i.opt._autoSlide)) {
        var l = i.containerWidth / i.opt.itemWidth;
        i.opt._autoSlide = i.opt.slidesToShow = i.opt.exactWidth ? l : Math.max(1, Math.floor(l));
      }
      "auto" === i.opt.slidesToScroll && (i.opt.slidesToScroll = Math.floor(i.opt.slidesToShow)),
        (i.itemWidth = i.opt.exactWidth ? i.opt.itemWidth : i.containerWidth / i.opt.slidesToShow),
        [].forEach.call(i.slides, function(e) {
          (e.style.height = "auto"), (e.style.width = i.itemWidth + "px"), (o += i.itemWidth), (r = Math.max(e.offsetHeight, r));
        }),
        (i.track.style.width = o + "px"),
        (i.trackWidth = o),
        (i.isDrag = !1),
        (i.preventClick = !1),
        i.opt.resizeLock && i.scrollTo(i.slide * i.itemWidth, 0),
        (s || t) && (i.bindArrows(), i.buildDots(), i.bindDrag()),
        i.updateControls(),
        i.emit(e ? "refresh" : "loaded");
    }),
    (t.bindDrag = function() {
      var t = this;
      t.mouse = t.mouse || t.handleMouse.bind(t);
      function e() {
        (t.mouseDown = void 0), t.ele.classList.remove("drag"), t.isDrag && (t.preventClick = !0), (t.isDrag = !1);
      }
      var i = {
        mouseup: e,
        mouseleave: e,
        mousedown: function(e) {
          e.preventDefault(), e.stopPropagation(), (t.mouseDown = e.clientX), t.ele.classList.add("drag");
        },
        mousemove: t.mouse,
        click: function(e) {
          t.preventClick && (e.preventDefault(), e.stopPropagation()), (t.preventClick = !1);
        }
      };
      t.ele.classList.toggle("draggable", !0 === t.opt.draggable), t.event(t.ele, "remove", i), t.opt.draggable && t.event(t.ele, "add", i);
    }),
    (t.buildDots = function() {
      var e = this;
      if (e.opt.dots) {
        if (("string" == typeof e.opt.dots ? (e.dots = document.querySelector(e.opt.dots)) : (e.dots = e.opt.dots), e.dots)) {
          (e.dots.innerHTML = ""), e.dots.classList.add("glider-dots");
          for (var t = 0; t < Math.ceil(e.slides.length / e.opt.slidesToShow); ++t) {
            var i = document.createElement("button");
            (i.dataset.index = t),
              i.setAttribute("aria-label", "Page " + (t + 1)),
              i.setAttribute("role", "tab"),
              (i.className = "glider-dot " + (t ? "" : "active")),
              e.event(i, "add", { click: e.scrollItem.bind(e, t, !0) }),
              e.dots.appendChild(i);
          }
        }
      } else e.dots && (e.dots.innerHTML = "");
    }),
    (t.bindArrows = function() {
      var i = this;
      i.opt.arrows
        ? ["prev", "next"].forEach(function(e) {
            var t = i.opt.arrows[e];
            t &&
              ("string" == typeof t && (t = document.querySelector(t)),
              t &&
                ((t._func = t._func || i.scrollItem.bind(i, e)),
                i.event(t, "remove", { click: t._func }),
                i.event(t, "add", { click: t._func }),
                (i.arrows[e] = t)));
          })
        : Object.keys(i.arrows).forEach(function(e) {
            var t = i.arrows[e];
            i.event(t, "remove", { click: t._func });
          });
    }),
    (t.updateControls = function(e) {
      var d = this;
      e && !d.opt.scrollPropagate && e.stopPropagation();
      var t = d.containerWidth >= d.trackWidth;
      d.opt.rewind ||
        (d.arrows.prev &&
          (d.arrows.prev.classList.toggle("disabled", d.ele.scrollLeft <= 0 || t),
          d.arrows.prev.classList.contains("disabled")
            ? d.arrows.prev.setAttribute("aria-disabled", !0)
            : d.arrows.prev.setAttribute("aria-disabled", !1)),
        d.arrows.next &&
          (d.arrows.next.classList.toggle("disabled", Math.ceil(d.ele.scrollLeft + d.containerWidth) >= Math.floor(d.trackWidth) || t),
          d.arrows.next.classList.contains("disabled")
            ? d.arrows.next.setAttribute("aria-disabled", !0)
            : d.arrows.next.setAttribute("aria-disabled", !1))),
        (d.slide = Math.round(d.ele.scrollLeft / d.itemWidth)),
        (d.page = Math.round(d.ele.scrollLeft / d.containerWidth));
      var c = d.slide + Math.floor(Math.floor(d.opt.slidesToShow) / 2),
        h = Math.floor(d.opt.slidesToShow) % 2 ? 0 : c + 1;
      1 === Math.floor(d.opt.slidesToShow) && (h = 0),
        d.ele.scrollLeft + d.containerWidth >= Math.floor(d.trackWidth) && (d.page = d.dots ? d.dots.children.length - 1 : 0),
        [].forEach.call(d.slides, function(e, t) {
          var i = e.classList,
            o = i.contains("visible"),
            r = d.ele.scrollLeft,
            s = d.ele.scrollLeft + d.containerWidth,
            l = d.itemWidth * t,
            a = l + d.itemWidth;
          [].forEach.call(i, function(e) {
            /^left|right/.test(e) && i.remove(e);
          }),
            i.toggle("active", d.slide === t),
            c === t || (h && h === t)
              ? i.add("center")
              : (i.remove("center"), i.add([t < c ? "left" : "right", Math.abs(t - (t < c ? c : h || c))].join("-")));
          var n = Math.ceil(l) >= Math.floor(r) && Math.floor(a) <= Math.ceil(s);
          i.toggle("visible", n), n !== o && d.emit("slide-" + (n ? "visible" : "hidden"), { slide: t });
        }),
        d.dots &&
          [].forEach.call(d.dots.children, function(e, t) {
            e.classList.toggle("active", d.page === t);
          }),
        e &&
          d.opt.scrollLock &&
          (clearTimeout(d.scrollLock),
          (d.scrollLock = setTimeout(function() {
            clearTimeout(d.scrollLock),
              0.02 < Math.abs(d.ele.scrollLeft / d.itemWidth - d.slide) &&
                (d.mouseDown || (d.trackWidth > d.containerWidth + d.ele.scrollLeft && d.scrollItem(d.getCurrentSlide())));
          }, d.opt.scrollLockDelay || 250)));
    }),
    (t.getCurrentSlide = function() {
      var e = this;
      return e.round(e.ele.scrollLeft / e.itemWidth);
    }),
    (t.scrollItem = function(e, t, i) {
      i && i.preventDefault();
      var o = this,
        r = e;
      if ((++o.animate_id, !0 === t)) (e *= o.containerWidth), (e = Math.round(e / o.itemWidth) * o.itemWidth);
      else {
        if ("string" == typeof e) {
          var s = "prev" === e;
          if (
            ((e = o.opt.slidesToScroll % 1 || o.opt.slidesToShow % 1 ? o.getCurrentSlide() : o.slide),
            s ? (e -= o.opt.slidesToScroll) : (e += o.opt.slidesToScroll),
            o.opt.rewind)
          ) {
            var l = o.ele.scrollLeft;
            e = s && !l ? o.slides.length : !s && l + o.containerWidth >= Math.floor(o.trackWidth) ? 0 : e;
          }
        }
        (e = Math.max(Math.min(e, o.slides.length), 0)), (o.slide = e), (e = o.itemWidth * e);
      }
      return (
        o.scrollTo(e, o.opt.duration * Math.abs(o.ele.scrollLeft - e), function() {
          o.updateControls(), o.emit("animated", { value: r, type: "string" == typeof r ? "arrow" : t ? "dot" : "slide" });
        }),
        !1
      );
    }),
    (t.settingsBreakpoint = function() {
      var e = this,
        t = e._opt.responsive;
      if (t) {
        t.sort(function(e, t) {
          return t.breakpoint - e.breakpoint;
        });
        for (var i = 0; i < t.length; ++i) {
          var o = t[i];
          if (n.innerWidth >= o.breakpoint)
            return e.breakpoint !== o.breakpoint && ((e.opt = Object.assign({}, e._opt, o.settings)), (e.breakpoint = o.breakpoint), !0);
        }
      }
      var r = 0 !== e.breakpoint;
      return (e.opt = Object.assign({}, e._opt)), (e.breakpoint = 0), r;
    }),
    (t.scrollTo = function(t, i, o) {
      var r = this,
        s = new Date().getTime(),
        l = r.animate_id,
        a = function() {
          var e = new Date().getTime() - s;
          (r.ele.scrollLeft = r.ele.scrollLeft + (t - r.ele.scrollLeft) * r.opt.easing(0, e, 0, 1, i)),
            e < i && l === r.animate_id ? n.requestAnimationFrame(a) : ((r.ele.scrollLeft = t), o && o.call(r));
        };
      n.requestAnimationFrame(a);
    }),
    (t.removeItem = function(e) {
      var t = this;
      t.slides.length && (t.track.removeChild(t.slides[e]), t.refresh(!0), t.emit("remove"));
    }),
    (t.addItem = function(e) {
      this.track.appendChild(e), this.refresh(!0), this.emit("add");
    }),
    (t.handleMouse = function(e) {
      var t = this;
      t.mouseDown && ((t.isDrag = !0), (t.ele.scrollLeft += (t.mouseDown - e.clientX) * (t.opt.dragVelocity || 3.3)), (t.mouseDown = e.clientX));
    }),
    (t.round = function(e) {
      var t = 1 / (this.opt.slidesToScroll % 1 || 1);
      return Math.round(e * t) / t;
    }),
    (t.refresh = function(e) {
      this.init(!0, e);
    }),
    (t.setOption = function(t, e) {
      var i = this;
      i.breakpoint && !e
        ? i._opt.responsive.forEach(function(e) {
            e.breakpoint === i.breakpoint && (e.settings = Object.assign({}, e.settings, t));
          })
        : (i._opt = Object.assign({}, i._opt, t)),
        (i.breakpoint = 0),
        i.settingsBreakpoint();
    }),
    (t.destroy = function() {
      function e(t) {
        t.removeAttribute("style"),
          [].forEach.call(t.classList, function(e) {
            /^glider/.test(e) && t.classList.remove(e);
          });
      }
      var t = this,
        i = t.ele.cloneNode(!0);
      (i.children[0].outerHTML = i.children[0].innerHTML),
        e(i),
        [].forEach.call(i.getElementsByTagName("*"), e),
        t.ele.parentNode.replaceChild(i, t.ele),
        t.event(n, "remove", { resize: t.resize }),
        t.emit("destroy");
    }),
    (t.emit = function(e, t) {
      var i = new n.CustomEvent("glider-" + e, { bubbles: !this.opt.eventPropagate, detail: t });
      this.ele.dispatchEvent(i);
    }),
    (t.event = function(e, t, i) {
      var o = e[t + "EventListener"].bind(e);
      Object.keys(i).forEach(function(e) {
        o(e, i[e]);
      });
    }),
    e
  );
});

var head = document.getElementsByTagName("head")[0];
var link = document.createElement("style");
link.innerHTML =
  ".glider,.glider-contain{margin:0 auto;position:relative}.glider,.glider-track{transform:translateZ(0)}.glider-dot,.glider-next,.glider-prev{border:0;padding:0;user-select:none;outline:0}.glider-contain{width:100%}.glider{overflow-y:hidden;-webkit-overflow-scrolling:touch;-ms-overflow-style:none}.glider-track{width:100%;margin:0;padding:0;display:flex;z-index:1}.glider.draggable{user-select:none;cursor:-webkit-grab;cursor:grab}.glider.draggable .glider-slide img{user-select:none;pointer-events:none}.glider.drag{cursor:-webkit-grabbing;cursor:grabbing}.glider-slide{user-select:none;justify-content:center;align-content:center;width:100%}.glider-slide img{max-width:100%}.glider::-webkit-scrollbar{opacity:0;height:0}.glider-next,.glider-prev{position:static;background:0 0;z-index:2;font-size:40px;text-decoration:none;left:-23px;top:30%;cursor:pointer;color:#666;opacity:1;line-height:1;transition:opacity .5s cubic-bezier(.17,.67,.83,.67),color .5s cubic-bezier(.17,.67,.83,.67)}.glider-next:focus,.glider-next:hover,.glider-prev:focus,.glider-prev:hover{color:#ccc}.glider-next{right:-23px;left:auto}.glider-next.disabled,.glider-prev.disabled{opacity:.25;color:#666;cursor:default}.glider-hide{opacity:0}.glider-dots{user-select:none;display:flex;flex-wrap:wrap;justify-content:center;margin:0 auto;padding:0}.glider-dot{display:block;cursor:pointer;color:#ccc;border-radius:999px;background:#ccc;width:12px;height:12px;margin:7px}.glider-dot:focus,.glider-dot:hover{background:#ddd}.glider-dot.active{background:#a89cc8}@media(max-width:36em){.glider::-webkit-scrollbar{opacity:1;-webkit-appearance:none;width:7px;height:3px}.glider::-webkit-scrollbar-thumb{opacity:1;border-radius:99px;background-color:rgba(156,156,156,.25);-webkit-box-shadow:0 0 1px rgba(255,255,255,.25);box-shadow:0 0 1px rgba(255,255,255,.25)}}";
head.appendChild(link);
