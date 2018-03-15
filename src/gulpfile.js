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
  return GULP.src([
    paths.site.src+"assets/icons/bf44.png"
    ,paths.site.src+"assets/icons/bf15.ico"
    ,paths.site.src+"assets/icons/bf57.png"
    ,paths.site.src+"assets/images/vacation.jpg"
    ,paths.site.src+"assets/images/apocalypse-architecture.jpg"
    ,paths.site.src+"assets/images/brutalist-framework512.jpg"
    ])
  .pipe(PLUMBER())
  .pipe(IMAGEMIN({ optimizationLevel: 3, progressive: true, interlaced: true }))
  // .pipe(DEBUG())
  .pipe(GULP.dest(paths.site.dist+"/img/"));
 }//img


 /* ------------------------- JS ------------- */
 var copyjs=  ()=>{
  return GULP.src(
    [
    paths.site.src+"js/jquery.js"
    ,paths.site.src+"js/brutalist.js"
    ,paths.site.src+"js/start.brutalizing.js"
    ]
    )
  .pipe(GULP.dest(paths.interm+"/js/"));
};

var jsify=  ()=>{
  return GULP.src(
    [
    paths.interm+"/js/jquery.js"
    ,paths.interm+"/js/brutalist.js"
    ,paths.interm+"/js/start.brutalizing.js"
    ]
    )
  .pipe(PLUMBER())
  // .pipe(BABEL({ presets: ['es2015'] }))
  .pipe(UGLIFY())
  .pipe(CONCAT('lotpinc.min.js'))
  .pipe(GULP.dest(paths.site.dist+"/js/"));
};

/* ------------------------- STYLE ------------- */
var copycss=  ()=>{
  return GULP.src(
    [
    paths.site.src+"css/core/grids/default-grid.css"
    ,paths.site.src+"css/core/grids/flexboxgrid.css"
    ,paths.site.src+"css/core/bfx.css"
    ,paths.site.src+"css/core/buix.css"
    ,paths.site.src+"css/core/butch.css"
    ,paths.site.src+"css/core/default.css"
    ,paths.site.src+"css/core/flavors.css"
    ,paths.site.src+"css/theme.css"
    ]
    )
  .pipe(GULP.dest(paths.interm+"/css/"));
};

var cssify = ()=>{

  return GULP.src([
    // paths.interm+"/css/*.{css}"
    // ,paths.interm+"css/theme.css"
    paths.interm+"/css/default-grid.css"
    ,paths.interm+"/css/flexboxgrid.css"
    ,paths.interm+"/css/bfx.css"
    ,paths.interm+"/css/buix.css"
    ,paths.interm+"/css/butch.css"
    ,paths.interm+"/css/default.css"
    ,paths.interm+"/css/flavors.css"
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
  return GULP.src(paths.site.src+"index.html")
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
  .pipe(GULP.dest(paths.site.dist))
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
  // clean
  GULP.parallel(
    img
    // follwing get further processing
    ,copycss
    ,copyjs
    // ,fonts
    )
  ,GULP.parallel(
    html
    ,cssify
    ,jsify
    )
  ,GULP.parallel(
    browsersync
    // ,watch_style
    ,watch_html
    )
  );//develop

GULP.task('default', develop);
