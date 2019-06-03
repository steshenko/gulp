const gulp = require('gulp');
const cssnano = require('gulp-cssnano');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cmq = require('gulp-combine-mq');
const browserSync = require('browser-sync').create();
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const uglifyJs = require('gulp-uglify');
const concatJs = require('gulp-concat');
const babel = require('gulp-babel');
const notify = require('gulp-notify');

const paths = {
  src: {
    styles: {
      app: 'src/assets/scss/main.scss',
      appAll: 'src/assets/scss/**/*.scss'
    },
    scripts: {
      appAll: [
        './src/assets/js/main.js'
      ],
      libs: [
        './node_modules/jquery/dist/jquery.min.js',
      ]
    },
    images: {
      all: 'src/assets/images/*'
    }
  },
  web: {
    styles: {
      app: {
        file: 'main.css',
        dir: 'build/css'
      }
    },
    scripts: {
      app: {
        file: 'main.js',
        dir: 'build/js'
      },
      libs: {
        file: 'libs.js',
        dir: 'build/js'
      }
    },
    images: {
      app: 'build/images'
    }
  }
};

function scss() {
  return gulp.src(paths.src.styles.app)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', notify.onError()))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cmq({
      beautify: true
    }))
    .pipe(cssnano()) // No MiniFy
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.web.styles.app.dir));
}

function libsJs() {
  return gulp.src(paths.src.scripts.libs)
    .pipe(concatJs(paths.web.scripts.libs.file))
    .pipe(uglifyJs().on('error', notify.onError()))
    .pipe(gulp.dest(paths.web.scripts.libs.dir));
}

function js() {
  return gulp.src(paths.src.scripts.appAll)
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['env'] }).on('error', notify.onError()))
    .pipe(concatJs(paths.web.scripts.app.file))
    .pipe(uglifyJs().on('error', notify.onError()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.web.scripts.app.dir));
}

function images() {
  return gulp.src(paths.src.images.all)
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(paths.web.images.app));
}

function watch() {
  gulp.watch(paths.src.styles.appAll, scss);
  browserSync.init({
    server: {
      baseDir: './build'
    }
  });
  browserSync.watch('**/*.*').on('change', browserSync.reload);
}

gulp.task('default', gulp.series(
  scss,
  images,
  libsJs,
  js,
  watch
));