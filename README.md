Slider
===

Slider displays markdown files as a series of slides in the web browser. Any section of a markdown file that starts with

```markdown
A Slide Name
===
```
is considered the start of a section. 

Installation
===

- Clone this repository.
- `npm intsall`
- For now, edit slider.js with the URL of the markdown page you want to display as slides.
- Navigate to index.html in the repository with your browser.
- You might also want to serve the web page properly and put your markdown files within the directory being served. That way the AJAX request that Slider makes with not give you a CORS error.

Todo
===
- Fix annoying scroll issues
- Automatically center current slide in sidebar?
- Make a config file with a list of markdown files to serve as slides, and an index page that allows you to swtich among them.
- Collapse index sidebar
- Make this whole thing easier to install and use.
- Add screen backgrounds, styles, etc.

