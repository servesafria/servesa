# `plugin: router/pages`

## Configuration

In your `servesa.yaml` :

```yaml
services:
  - plugin:    router/pages
    directory: pages
    url:       /
```

`router/pages` generates routes from your directory structure. The relative path of each page within `directory` becomes the relative url under `url` .

## Example directory structure

```yaml
  pages
    index.jsx     # /
    about.jsx     # /about
    contact
      index.jsx   # /contact/
      form.jsx    # /contact/form
    tasks
      index.jsx   # /tasks
      :id         # 
        index.jsx # /tasks/:id/
        show      # /tasks/:id/show 
```
