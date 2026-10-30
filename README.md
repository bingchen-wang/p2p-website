# p2p
Project page for "Prompts to Proxies: Emulating Human Preferences via a Compact LLM Ensemble".


## P2P Studio preview

The Software section contains a responsive, interactive preview of Studio's
Ensemble and Evidence views. It runs as static HTML/CSS/JavaScript; it requires
no site build, model calls, or new dependencies. Serve this directory over HTTP
(for example, `python3 -m http.server 8000`) to load the recorded data.

- `studio-preview.css`: scoped Studio theme and responsive layouts.
- `studio-preview.js`: tabs, proxy/option inspection, keyboard navigation.
- `assets/studio/w42.json`: recorded lasso walkthrough data and provenance.
- `assets/studio/mark.png`: the original Studio dark-background logo mark.

The snapshot comes from the paper's W42 walkthrough,
`outputs/paper/ATP_w42_20250919_022806`, replayed with its recorded CV folds:
300 generated proxies, 58 retained by lasso, 10 negative coefficients. All
exported proxy weights are lasso weights; the frozen run's default elastic-net
export is not used. The backend is `gemini-2.0-flash`, verified against the
generation config and token-usage logs. Data/source digests are in the snapshot.

The Evidence view uses only the held-out question illustrated in the paper,
`RQ4_F1Ae_W42`, and its five response options. As in Studio's earlier-run reader,
shares are categorical weighted responses normalised by the signed weight sum.
Question MSE describes these five displayed shares; it is distinct from the
paper's raw test MSE across all held-out question-option rows. The archive's
zero-mass `nan` placeholder is omitted; the actual Refused option is retained.

The square proxy formation preserves the 18-column order and encodings: shirt
colour indicates template family, size indicates absolute coefficient, negative
weights are striped, and the inspected proxy is outlined. Positions are a
display arrangement, not psychological or demographic coordinates.

The preview adapts the real Studio inspector for the project page. On small
screens, selecting a proxy or option reveals its inspector, with a return link
to the grid/options. Tabs support arrow keys; the proxy grid uses a single Tab
stop plus arrow keys, Home/End, and Ctrl+Home/End.

The offline demo is a separate synthetic example, mentioned only in the
installation area. The W42 preview is the Gemini-backed paper run. Installation
includes Studio's one-time frontend build, as documented in the P2P README.

The Studio preview is a responsive collage: Ensemble ↔ Evidence occupies about
two thirds of the width, alongside an Entropy Explorer panel. On laptop windows
(at least 1101 px wide and 600 px tall), the frame follows the viewport with 64 px
of surrounding space and a 790 px height cap. Inspectors and diagnostics scroll
within their panes; narrower windows and phones stack the components. The original light P2P
logo occupies its own middle column between installation copy and launch
commands. Narrow layouts use two columns and then stack on phones.

Entropy Explorer adapts Studio's mode entropy/selection map and persistent
entropy trajectory. The 23 modes and 11 generation snapshots come directly from
`persistent_mode_entropy.csv` and `mode_summary.csv` in the same archived W42
run. Generated counts are checked against the 300 endowments. Selected counts
are derived by exact mode join from this preview's replayed constrained-lasso
coefficients (58 retained), rather than from a different model's stored summary.
Map position shows final normalized entropy and retained proxies; point size
shows generated proxies. Clicking a point or choosing a mode updates its entropy,
selection count, and trajectory; trajectories begin at the first recorded step
for that mode. Both charts retain the actual family colours and data values.

The mode-entropy trend redraws its SVG to the actual pane dimensions with a
ResizeObserver. It fills remaining vertical space in desktop panes and retains
readable labels during resizing; smaller layouts use a 140 px tall chart.

## Survey source and attribution

The human survey question, response options, and aggregate human response shares
are drawn from **The American Trends Panel Wave 42 - Trust in Science,
Pew Research Center, 2019**. The [canonical W42 source](https://www.pewresearch.org/dataset/american-trends-panel-wave-42/)
is linked below the preview. The preview deliberately shows the one held-out
question used in the paper's W42 walkthrough; this is an editorial selection,
not a claimed numerical limit in the ATP licence.

Analysis, model predictions, synthetic proxies, and model diagnostics are by
the P2P authors. Pew Research Center bears no responsibility for the analyses
or interpretations presented here.

The same source, scope, disclaimer, and third-party rights notice accompany the
machine-readable excerpt in `assets/studio/w42.json` under `attribution`.
Third-party survey material remains subject to the applicable ATP data-use terms;
this website does not grant additional rights to it. Attribution is not a claim
that redistribution is unrestricted. Check the applicable download agreement
before expanding the excerpt or adding data exports.
