# Reorganization validation — November 19, 2026

Validated the prepared directory layout before applying it to the demo copy:

- All Python source and test files parsed successfully.
- Relocated server and data-reader imports succeeded.
- Root page, named entry page, and all four JavaScript files returned HTTP 200.
- Source and documentation paths stayed outside the static web root (HTTP 404).
- Invalid-model API routing returned HTTP 400 as expected.
- Local script references resolved in the entry page and isolated test pages.
- The root launcher accepted `--help` from another working directory.
- Seven isolated scalar behavior checks passed in headless Edge.
- Fifteen isolated station behavior checks passed in headless Edge.
- Live SFBOFS integration passed: 53 metadata markers, 43 visible in the test
  viewport, hidden at zoom 4, and cached markers reused after zooming back.

Headless Edge required execution outside the filesystem sandbox. No full
73-combination live field sweep was run for this file-layout change. Existing
historical reports remain separate from these results. JavaScript rendering
and numeric data-reader implementations were preserved unchanged.
