'use strict';

// https://www.w3schools.com/howto/howto_js_fullscreen.asp
// document.documentElement.webkitRequestFullscreen();

const e = React.createElement;
const converter = new showdown.Converter();

function parse(text) {
  let lines = text.split("\n");
  let sections = [];
  let i = 0;
  let section = "";
  while (i < lines.length) {
    if (i + 2 < lines.length && lines[i + 1] == "===") {
      if (section != "") {
        sections.push(section);
      }
      section = "";
    }
    section += lines[i] + "\n";

    i++;
  }
  sections.push(section);
  return sections;
}

class Slider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      slide: 0,
      fullscreen: false
    };
    this.forward = this.forward.bind(this);
    this.reverse = this.reverse.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    fetch("/course/week_1/README.md").then(res => res.text()).then(result => {
      let slides = parse(result);
      let titles = slides.map(s => s.split("===")[0]);
      this.setState({
        isLoaded: true,
        slides: slides,
        titles: titles
      });
    }, error => {
      this.setState({
        isLoaded: true,
        error
      });
    });
  }

  forward() {
    if (this.state.slide < this.state.slides.length - 1) {
      this.setState({ slide: this.state.slide + 1 });
    }
  }

  reverse() {
    if (this.state.slide > 0) {
      this.setState({ slide: this.state.slide - 1 });
    }
  }

  fullscreen() {
    if (this.state.fullscreen) {
      document.webkitExitFullscreen();
    } else {
      document.documentElement.webkitRequestFullscreen();
    }
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  handleKeyDown(event) {
    if (event.key == "ArrowRight") {
      this.forward();
    } else if (event.key == "ArrowLeft") {
      this.reverse();
    }
  }

  make_slide_divs(slides) {
    return slides.flatMap((s, i) => {
      let classes = "markdown-body slide";
      if (this.state.slide == i) {
        classes += " active-slide";
      }
      return React.createElement("div", { key: i,
        className: classes,
        dangerouslySetInnerHTML: { __html: converter.makeHtml(s) } });
    });
  }

  make_title_divs(slides) {
    let titles = slides.map(s => s.split("===")[0]);
    return titles.flatMap((t, i) => {
      let classes = "title";
      if (this.state.slide == i) {
        classes += " active-title";
      }
      return React.createElement(
        "div",
        { key: i,
          onClick: () => {
            console.log(i);this.setState({ slide: i });
          },
          className: classes },
        t
      );
    });
  }

  render() {
    const { error, isLoaded, slides } = this.state;
    if (error) {
      return React.createElement(
        "div",
        null,
        "Error: ",
        error.message
      );
    } else if (!isLoaded) {
      return React.createElement(
        "div",
        null,
        "Loading..."
      );
    } else {
      const slide_divs = this.make_slide_divs(slides);
      const title_divs = this.make_title_divs(slides);
      return React.createElement(
        "div",
        { tabIndex: "0", onKeyDown: this.handleKeyDown, className: "slider-container" },
        React.createElement(
          "div",
          { className: "slide-index" },
          title_divs
        ),
        React.createElement(
          "div",
          { className: "slides-container" },
          slide_divs,
          React.createElement(
            "button",
            { id: "forward",
              onClick: this.forward,
              disabled: this.state.slide == this.state.slides.length - 1 },
            "\u25B6"
          ),
          React.createElement(
            "button",
            { id: "reverse",
              onClick: this.reverse,
              disabled: this.state.slide == 0 },
            "\u25C0"
          ),
          React.createElement(
            "button",
            { id: "expand",
              onClick: this.fullscreen },
            "\u25F3"
          )
        )
      );
    }
  }
}

const main = document.querySelector('#main');
ReactDOM.render(e(Slider), main);
