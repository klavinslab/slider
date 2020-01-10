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

    let slide = parseInt(Cookies.get("slide"));
    if (!slide) {
      slide = 0;
    }

    let deck = parseInt(Cookies.get("deck"));
    if (!deck) {
      deck = 0;
    }

    let sb = Cookies.get("sidebar");
    if (!sb) {
      sb = "decks";
    }

    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      slide: slide,
      deck: deck,
      fullscreen: false,
      sidebar: sb
    };
    this.forward = this.forward.bind(this);
    this.reverse = this.reverse.bind(this);
    this.go = this.go.bind(this);
    this.switch_deck = this.switch_deck.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    fetch("/slider/config.json").then(result => result.json()).then(config => {
      this.config = config;
      return fetch(config.slide_decks[this.state.deck].path);
    }).then(res => res.text()).then(result => {
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
      Cookies.set("slide", this.state.slide + 1);
      this.setState({ slide: this.state.slide + 1 });
    }
  }

  reverse() {
    if (this.state.slide > 0) {
      Cookies.set("slide", this.state.slide - 1);
      this.setState({ slide: this.state.slide - 1 });
    }
  }

  go(n) {
    Cookies.set("slide", n);
    this.setState({ slide: n });
  }

  switch_deck(n) {
    Cookies.set("deck", n);
    Cookies.set("slide", 0);
    Cookies.set("sidebar", "slides");
    this.setState({ deck: n, slide: 0, sidebar: "slides" });
    this.componentDidMount();
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
            this.go(i);
          },
          className: classes },
        t
      );
    });
  }

  make_deck_divs() {
    return this.config.slide_decks.flatMap((d, i) => {
      let classes = "deck";
      if (this.state.deck == i) {
        classes += " active-deck";
      }
      return React.createElement(
        "div",
        { key: i,
          onClick: () => {
            this.switch_deck(i);
          },
          className: classes },
        React.createElement(
          "span",
          null,
          i + 1,
          ": ",
          d.title
        )
      );
    });
  }

  make_buttons() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "button",
        { id: "forward-button",
          onClick: this.forward,
          disabled: this.state.slide == this.state.slides.length - 1 },
        "\u25B6"
      ),
      React.createElement(
        "button",
        { id: "reverse-button",
          onClick: this.reverse,
          disabled: this.state.slide == 0 },
        "\u25C0"
      ),
      React.createElement(
        "button",
        { id: "expand-button",
          onClick: this.fullscreen },
        "\u25F3"
      )
    );
  }

  make_sidebar_title() {
    return React.createElement(
      "div",
      { id: "sidebar-title",
        onClick: () => {
          if (this.state.sidebar == "decks") {
            this.setState({ sidebar: "slides" });
            Cookies.set("sidebar", "slides");
          } else {
            this.setState({ sidebar: "decks" });
            Cookies.set("sidebar", "decks");
          }
        } },
      this.state.sidebar == "decks" ? "Decks" : "Slides"
    );
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
      const deck_divs = this.make_deck_divs();
      let sidebar = "";
      let sidebar_title = this.make_sidebar_title();
      if (this.state.sidebar == "slides") {
        sidebar = React.createElement(
          "div",
          { className: "sidebar" },
          sidebar_title,
          title_divs
        );
      } else {
        sidebar = React.createElement(
          "div",
          { className: "sidebar" },
          sidebar_title,
          deck_divs
        );
      }
      let buttons = this.make_buttons();
      return React.createElement(
        "div",
        { tabIndex: "0", onKeyDown: this.handleKeyDown, className: "slider-container" },
        sidebar,
        React.createElement(
          "div",
          { className: "slides-container" },
          slide_divs,
          buttons
        )
      );
    }
  }

  componentDidUpdate() {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightBlock(block);
    });
  }

}

const main = document.querySelector('#main');
ReactDOM.render(e(Slider), main);
