const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const watch = require('gulp-watch');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyjs');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const del = require('del');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const notify = require('gulp-notify');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function (done) {
  return gulp.src('src/sass/**/*.sass')
    .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
    .pipe(rename({suffix: '.min', prefix : ''}))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({stream: true}))
    done();
});

gulp.task('browser-sync', function(done) { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: 'src' // Директория для сервера - src
        },
        notify: false // Отключаем уведомления
    });
    done();
});

gulp.task('scripts', function(done) {
    return gulp.src([ // Берем все необходимые библиотеки
        'src/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'src/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('src/js')); // Выгружаем в папку src/js
        done();
})


gulp.task('watch', function(done) {
    gulp.watch('src/sass/**/*.sass', gulp.parallel('sass')); // Наблюдение за sass файлами в папке sass
    gulp.watch('src/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('src/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
    done();
});


gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку build перед сборкой
});

gulp.task('img', function() {
    return gulp.src('src/img/**/*') // Берем все изображения из src
        .pipe(imagemin({ // Сжимаем их с наилучшими настройками
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/img')); // Выгружаем на продакшен
});

gulp.task('img', function() {
    return gulp.src('src/img/**/*') // Берем все изображения из src
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img')); // Выгружаем на продакшен
});

gulp.task('build', gulp.parallel('sass', 'scripts', function(done) {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'src/css/main.min.css',
        'src/css/libs.min.css'
        ])
    .pipe(gulp.dest('build/css'))

    var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('build/fonts'))

    var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('build/js'))

    var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('build'));
    done();
}));

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('default', gulp.parallel('watch', 'browser-sync', 'scripts'));
