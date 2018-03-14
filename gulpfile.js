const GULP = require('gulp')
,FS = require('fs')
,CONCAT = require('gulp-concat')
,UGLIFY = require('gulp-uglify')
,BROWSERSYNC = require('browser-sync')
,DEL = require('del')
,PLUMBER     = require('gulp-plumber')
,HTMLREPLACE = require('gulp-html-replace')
,HTMLMIN     = require('gulp-htmlmin')
,DEBUG     = require('gulp-debug')
,WRAP    = require('gulp-wrap')
,DECLARE    = require('gulp-declare')
,RENAME = require('gulp-rename')
,CLEANCSS = require('gulp-clean-css')
,IMAGEMIN    = require('gulp-imagemin')
,FSTREAM = require("fstream")
,BABEL = require('gulp-babel')
,RP=require('request-promise')
;

var paths = {
  staging:"staging"
  ,interm:"../interm"
  ,site:{
    src:"./"
    ,dist:"../dist"
  }
};

var browsersync =()=>{
  BROWSERSYNC({
    files: [paths.site.dist+'/*']
    ,server: [paths.site.dist+'/']
  });
};

/* ------------------------- IMG ------------- */

var img = ()=>{
  return GULP.src(paths.site.src+"/**/*.{jpg,png,gif,svg}")
  .pipe(PLUMBER())
  .pipe(IMAGEMIN({ optimizationLevel: 3, progressive: true, interlaced: true }))
  // .pipe(DEBUG())
  .pipe(GULP.dest(paths.site.dist+"/img/"));
 }//img


/* ------------------------- STYLE ------------- */
var copycss=  ()=>{
  return GULP.src(
    [
      paths.site.src+"/css/core/core.css"
,paths.site.src+"/css/theme.css"
      ]
      )
  .pipe(GULP.dest(paths.interm+"/css/"));
};

var cssify = ()=>{

  return GULP.src([
    // paths.interm+"/css/*.{css}"
paths.interm+"/css/core.css"
,paths.interm+"/css/theme.css"
    ])
  // .pipe(DEBUG())
  .pipe(CONCAT('lotpinc.min.css'))
  .pipe(CLEANCSS())
  .pipe(GULP.dest(paths.site.dist+"/css/"));

}//cssify


/* ------------------------- FONTS ------------- */
var fonts=  ()=>{
  return GULP.src(
    [
      paths.site.src+"/Rauchwaren_Date_Mono-webfont.woff2"
,paths.site.src+"/rauchwaren_regular-webfont.woff2"
      ]
      )
  .pipe(GULP.dest(paths.dest+"/fonts/"));
};


/* ------------------------- HTML ------------- */

var html = ()=>{
  return GULP.src(paths.site.src+"/index.html")
  .pipe(HTMLREPLACE({
    'style': {
      src: null
      ,tpl:'<link rel="stylesheet" type="text/css" href="css/lotpinc.min.css" >'
    }
    // ,'js': {
    //   src: null
    //   ,tpl:'<script src="js/lib.min.js" type="text/javascript"></script><script src="js/cbb.min.js" type="text/javascript"></script>'
    // }
  }))
  .pipe(HTMLMIN({collapseWhitespace: true}))
  .pipe(RENAME({
    basename: 'index'
  }))
  .pipe(GULP.dest(paths.site.dist+"/"))
}

var clean = ()=>{
  return DEL([
    paths.site.dist+"/*"
    ,paths.interm+"/*"
    ]
    ,{force:true}
    )
}


/* ------------------------- WATCHES ------------- */

var watch_style = ()=>{
  return GULP
  .watch([
    paths.site.src+"*.css"
    ], GULP.series(
      copycss
      ,cssify
      ))
}

var watch_html = ()=>{
  return GULP
  .watch(
    paths.site.src+"index.html"
    , GULP.parallel(
      html
      ))
}


exports.img = img;
exports.copycss = copycss;
exports.cssify = cssify;
exports.html = html;
exports.fonts = fonts;
exports.clean = clean;

var develop = GULP.series(
  clean
  ,GULP.parallel(
    img
    // follwing get further processing
    ,copycss
    ,fonts
    )
  ,GULP.parallel(
    html
    ,cssify
    )
  ,GULP.parallel(
    browsersync
    // ,watch_style
    ,watch_html
    )
  );//develop

GULP.task('default', develop);
