module.exports = ({ file, options, env }) => ({
  plugins: {
    'autoprefixer': env == 'production' ? options.autoprefixer : false
  }
});
