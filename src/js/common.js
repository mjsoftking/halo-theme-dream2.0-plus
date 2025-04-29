window.encrypt = (str) => window.btoa(unescape(encodeURIComponent(str)))
window.decrypt = (str) => decodeURIComponent(escape(window.atob(str)))

const commonContext = {
  /* 初始化目录和公告模块 */
  initTocAndNotice() {
    const {pathname} = location
    window.tocPjax && window.tocPjax()
    let hideToc = $('.widget.toc .card-content ul').length === 0
    let hideNotice = (DreamConfig.notice_show_mode === 'toc' && !hideToc)
      || (DreamConfig.notice_show_mode === 'index' && pathname !== '/')
    if (hideToc) {
      $('.widget.toc,.action-toc').addClass('is-hidden-all')
    } else {
      $('.widget.toc,.action-toc').removeClass('is-hidden-all')
    }
    if (hideNotice) {
      $('.widget.notice').addClass('is-hidden-all')
    } else {
      $('.widget.notice').removeClass('is-hidden-all')
    }
  },
  /* 更新横幅大图的文字描述 */
  initBanner() {
    const $bannerInfoDesc = $('.banner-info-desc')
    if ($bannerInfoDesc.length === 0) return
    const bannerDesc = $bannerInfoDesc.text()
    $bannerInfoDesc.text('')
    let currentBannerDesc = ''
    let isWrite = true
    let id
    const updateDesc = function () {
      let num = currentBannerDesc.length
      if (isWrite && num < bannerDesc.length) {
        currentBannerDesc += bannerDesc.charAt(num)
        $bannerInfoDesc.text(currentBannerDesc)
      } else if (!isWrite && num > 0) {
        currentBannerDesc = currentBannerDesc.slice(0, num - 1)
        $bannerInfoDesc.text(currentBannerDesc)
      } else {
        clearInterval(id)
        isWrite = !isWrite
        id = setInterval(updateDesc, isWrite ? 500 : 80)
      }
    }
    id = setInterval(updateDesc, isWrite ? 500 : 80)
  },
  /* 激活图片预览功能 */
  initGallery() {
    // 用链接和标题包装图像
    $('.main-content img:not(.not-gallery)').each(function () {
      if ($(this).parents('[data-fancybox],mew-photos').length === 0) {
        $(this).wrap(`<div class="gallery-item"><div data-fancybox="gallery" data-options='{"hash": false}' ${this.alt ? `data-caption="${this.alt}"` : ''} href="${$(this).attr('src')
        }"></div>${(this.alt && DreamConfig.show_img_name) ? `<p>${this.alt}</p>` : ''}</div>`)
      }
    })
  },
  /* 初始化主题模式（仅用户模式） */
  initMode() {
    let isNight = localStorage.getItem('night') || false
    const applyNight = (isNightValue) => {
      if (isNightValue) {
        // 配色方案
        $('html').addClass('color-scheme-dark').removeClass('color-scheme-light').addClass('night').attr('night', true)
      } else {
        // 配色方案
        $('html').addClass('color-scheme-light').removeClass('color-scheme-dark').removeClass('night').removeAttr('night')
      }
      localStorage.setItem('night', isNightValue)
      isNight = isNightValue
    }
    //切换按钮
    $('#toggle-mode').on('click', () => applyNight(isNight.toString() !== 'true'))
    //加载后首选的配色
    if (DreamConfig.default_theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addListener((event) => applyNight(event.matches))
    } else {
      applyNight(isNight.toString() === 'true')
    }
  },
  /* 导航条高亮 */
  initNavbar() {
    const $nav_menus = $('.navbar-nav a')
    const $nav_side_menus = $('.panel-side-menu .link')
    let activeIndex = 0
    const {href, pathname} = location

    if (pathname && pathname !== '/') {
      for (let i = 0; i < $nav_menus.length; i++) {
        const cur_href = $nav_menus[i].getAttribute('href')
        if (pathname.includes(cur_href) || href.includes(cur_href)) {
          activeIndex = i
          if (pathname === cur_href || href === cur_href) break
        }
      }
    }

    // 高亮PC端
    const $curMenu = $nav_menus.eq(activeIndex)
    $curMenu.addClass('current')
    if ($curMenu.parents('.item-dropdown').length) {
      $curMenu
        .parents('.item-dropdown')
        .find('.item-dropdown-link a')
        .addClass('current')
    }

    // 高亮移动端
    $nav_side_menus.eq(activeIndex).addClass('current')
  },
  /* 搜索框弹窗 */
  searchDialog() {
    const $result = $('.navbar-search .result')
    $('.navbar-search .input').on('click', function (e) {
      e.stopPropagation()
      $result.addClass('active')
    })
    $(document).on('click', function () {
      $result.removeClass('active')
    })
  },
  /* 激活导航栏全局下拉框功能 */
  initDropMenu() {
    $('.item-dropdown').each(function (index, item) {
      const menu = $(this).find('.item-dropdown-menu')
      const trigger = $(item).attr('trigger') || 'click'
      const placement = $(item).attr('placement') || $(this).height() || 0
      menu.css('top', placement)
      if (trigger === 'hover') {
        $(this).hover(
          () => $(this).addClass('active'),
          () => $(this).removeClass('active')
        )
      } else {
        $(this).on('click', function (e) {
          e.stopPropagation()
          $(this).toggleClass('active')
          $(document).one('click', () => $(this).removeClass('active'))
          e.stopPropagation()
        })
        menu.on('click', (e) => e.stopPropagation())
      }
    })
  },
  /*初始化任务列表，禁止点击*/
  iniTaskItemDisabled() {
    $('li[data-type="taskItem"]').each(function () {
      $(this).find('label > input[type="checkbox"]').prop('disabled', true)
    })
  },
  /* 激活登录窗口下拉框功能 */
  initLogonMenu() {
    $('.navbar-logon').each(function (index, item) {
      const trigger = $(item).attr('trigger') || 'click'
      if (trigger === 'hover') {
        $(this).hover(
          () => $(this).addClass('active'),
          () => $(this).removeClass('active')
        )
      } else {
        $(this).on('click', function (e) {
          e.stopPropagation()
          $(this).toggleClass('active')
          $(document).one('click', () => $(this).removeClass('active'))
          e.stopPropagation()
        })
      }
    })
  },
  /* 处理滚动 */
  initScroll() {
    window.initTop = 0

    // true：上划，false：下滑
    function scrollDirection(currentTop) {
      const result = currentTop > window.initTop
      window.initTop = currentTop
      return result
    }

    const handleScroll = () => {
      const scrollTop = $(document).scrollTop()
      const direction = scrollDirection(scrollTop)
      const $body = $('body')
      const $actions = $('.actions')
      if (scrollTop > 50 && direction) {
        $body.addClass('move-up')
      } else {
        $body.removeClass('move-up')
      }
      if (scrollTop > 100) {
        $actions.addClass('show')
      } else {
        $actions.removeClass('show')
      }
    }
    document.addEventListener('scroll', handleScroll)
  },
  /* 小屏幕伸缩侧边栏，包含导航或者目录 */
  drawerMobile() {
    $('.navbar-slideicon').on('click', function (e) {
      e.stopPropagation()
      /* 关闭搜索框 */
      $('.navbar-searchout').removeClass('active')
      /* 处理开启关闭状态 */
      const $html = $('html')
      const $mask = $('.navbar-mask')
      const $slide_out = $('.navbar-slideout')
      if ($slide_out.hasClass('active')) {
        $html.removeClass('disable-scroll')
        $mask.removeClass('active slideout')
        $slide_out.removeClass('active')
      } else {
        $html.addClass('disable-scroll')
        $mask.addClass('active slideout')
        $slide_out.addClass('active')
      }
    })
    $('.action-toc').on('click', function (e) {
      e.stopPropagation()
      /* 关闭搜索框 */
      $('.navbar-searchout').removeClass('active')
      /* 处理开启关闭状态 */
      const $html = $('html')
      const $mask = $('.navbar-mask')
      const $slide_out = $('.navbar-slideout')
      if ($slide_out.hasClass('active')) {
        $html.removeClass('disable-scroll')
        $mask.removeClass('active slideout')
        $slide_out.removeClass('active slideout-toc')
      } else {
        $html.addClass('disable-scroll')
        $mask.addClass('active slideout')
        $slide_out.addClass('active slideout-toc')
      }
    })
  },
  /* 激活全局返回顶部功能 */
  back2Top() {
    $('#back-to-top').on('click', function () {
      $('body, html').animate({scrollTop: 0}, 400)
    })
  },
  /* 点击遮罩层关闭 */
  maskClose() {
    $('.navbar-mask')
      .on('click', function (e) {
        e.stopPropagation()
        $('html').removeClass('disable-scroll')
        $('.navbar-mask').removeClass('active slideout')
        $('.navbar-searchout').removeClass('active')
        $('.navbar-slideout').removeClass('active slideout-toc')
        $('.navbar-above').removeClass('solid')
      })
      .on('touchmove', (e) => e.preventDefault)
    $('.navbar .toc-content')
      .on('click', function (e) {
        e.stopPropagation()
        $('html').removeClass('disable-scroll')
        $('.navbar-mask').removeClass('active slideout')
        $('.navbar-slideout').removeClass('active slideout-toc')
      })
  },
  /* 移动端侧边栏菜单手风琴 */
  sideMenuMobile() {
    $('.navbar-slideout-menu .current')
      .parents('.panel-body')
      .show()
      .siblings('.panel')
      .addClass('in')
    $('.navbar-slideout-menu .panel').on('click', function (e) {
      e.stopPropagation()
      const $this = $(this)
      const panelBox = $this.parent().parent()
      /* 清除全部内容 */
      panelBox.find('.panel').not($this).removeClass('in')
      panelBox
        .find('.panel-body')
        .not($this.siblings('.panel-body'))
        .stop()
        .hide('fast')
      /* 激活当前的内容 */
      $this.toggleClass('in').siblings('.panel-body').stop().toggle('fast')
    })
  },
  /* 初始化事件 */
  initEvent() {
    let $body = $('body')

    function closeSelect(elem) {
      let $elem = $(elem)
      const closeSelect = $elem.attr('data-close')
      return closeSelect && closeSelect.trim() !== '' ? $elem.closest(closeSelect.trim()) : $elem
    }

    $body.on('click', '.click-close', function (e) {
      e.stopPropagation()
      closeSelect(this).remove()
    })
    $body.on('click', '.click-animation-close', function (e) {
      e.stopPropagation()
      let selectElem = closeSelect(this)
      selectElem.addClass('close-animation')
      setTimeout(() => selectElem.remove(), 300)
    })
  },
  /* 离屏提示 */
  offscreenTip() {
    if (Utils.isMobile() || (!DreamConfig.document_hidden_title && !DreamConfig.document_visible_title)) return
    // const originTitle = document.title
    let originTitle = document.title
    let timer = null
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (!DreamConfig.document_visible_title || document.title !== DreamConfig.document_visible_title) {
          originTitle = document.title
        }
        DreamConfig.document_hidden_title && (document.title = DreamConfig.document_hidden_title)
        clearTimeout(timer)
      } else {
        document.title = DreamConfig.document_visible_title || originTitle
        DreamConfig.document_visible_title && (timer = setTimeout(function () {
          if (document.title === DreamConfig.document_visible_title) {
            document.title = originTitle
          }
        }, 2000))
      }
    })
  },
  /** 初始化轮播 **/
  initCarousel() {
    window.Swiper && new Swiper('.swiper', {
      loop: true,
      parallax: true,
      effect: 'slide',
      spaceBetween: 10,
      speed: 600,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })
  },
  /** 关闭画廊 **/
  closeFancybox() {
    // 检测Fancybox是否打开
    if (document.querySelector('.fancybox-container')) {
      // 关闭Fancybox
      $.fancybox.close()
    }
  },
  /* 个人信息界面打印彩字 */
  sparkInput() {
    const sparkInputContent = DreamConfig.spark_input_content && DreamConfig.spark_input_content.filter(s => s.length > 0)
    if (sparkInputContent && sparkInputContent.length > 0) {
      Utils.cachedScript(`${DreamConfig.theme_base}/js/spark-input.min.js?mew=${DreamConfig.theme_version}`, function () {
        $('.spark-input').each((index, domEle) => sparkInput(domEle, [domEle.innerText, ...sparkInputContent]))
      })
    }
  },
  /* 恋爱墙倒计时 */
  loveTime() {
    let $elem = $('.love .love-time')
    if ($elem.length === 0) return
    let loveTime = $elem.attr('data-time')
    // 1. 严格校验格式
    if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(loveTime)) {
      $elem.text(loveTime)
      return
    }
    const grt = new Date(loveTime)
    setInterval(function () {
      let now = new Date(Date.now())
      let difference = parseInt((now - grt) / 1000)
      let seconds = difference % 60
      difference = parseInt(difference / 60)
      let minutes = difference % 60
      difference = parseInt(difference / 60)
      let hours = difference % 24
      let days = parseInt(difference / 24)
      let year = 0
      let grtYear = grt.getFullYear()
      let nowYear = now.getFullYear()
      while (grtYear < nowYear) {
        if ((grtYear % 4 === 0 && grtYear % 100 !== 0) || grtYear % 400 === 0) {
          // 闰年366天
          if (days < 366) break
          days -= 366
          year += 1
          grtYear += 1
        } else {
          // 平年365天
          if (days < 365) break
          days -= 365
          year += 1
          grtYear += 1
        }
      }
      if (year !== 0) {
        $elem.html(`${year} 年 ${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`)
      } else {
        $elem.html(`${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`)
      }
    }, 300)
  },
  /* 激活建站倒计时功能 */
  websiteTime() {
    if (!DreamConfig.website_time) {
      return
    }
    const websiteDate = document.getElementById('websiteDate')
    if (DreamConfig.website_time === '') {
      return
    }
    const grt = new Date(DreamConfig.website_time).getTime()
    setInterval(function () {
      let now = Date.now()
      let difference = parseInt((now - grt) / 1000)
      let seconds = difference % 60
      if (String(seconds).length === 1) {
        seconds = '0' + seconds
      }
      difference = parseInt(difference / 60)

      let minutes = difference % 60
      if (String(minutes).length === 1) {
        minutes = '0' + minutes
      }
      difference = parseInt(difference / 60)

      let hours = difference % 24
      if (String(hours).length === 1) {
        hours = '0' + hours
      }
      let days = parseInt(difference / 24)
      websiteDate.innerHTML = `建站<span class="stand">${days}</span>天<span class="stand">${hours}</span>时<span class="stand">${minutes}</span>分<span class="stand">${seconds}</span>秒`
    }, 300)
  },
  /* 显示web版权 */
  webCopyright() {
    if (!DreamConfig.website_time) {
      return
    }
    const webCopyright = document.getElementById('webCopyright')
    const now = new Date()
    let nowYear = now.getFullYear()
    const grt = new Date(DreamConfig.website_time)
    let getYear = grt.getFullYear()
    if (nowYear === getYear) {
      webCopyright.innerText = '© ' + nowYear
      return
    }

    webCopyright.innerText = '© ' + getYear + '-' + nowYear
  },
  /* 激活侧边栏人生倒计时 */
  initTimeCount() {
    if (!$('.timelife').length) {
      return
    }
    if (timeLifeHour === new Date().getHours()) {
      return
    }
    let timelife = [
      {
        title: '今日已经过去',
        endTitle: '小时',
        num: 0,
        percent: '0%',
      },
      {
        title: '这周已经过去',
        endTitle: '天',
        num: 0,
        percent: '0%',
      },
      {
        title: '本月已经过去',
        endTitle: '天',
        num: 0,
        percent: '0%',
      },
      {
        title: '今年已经过去',
        endTitle: '个月',
        num: 0,
        percent: '0%',
      },
    ]
    {
      let nowDate = +new Date()
      let todayStartDate = new Date(new Date().toLocaleDateString()).getTime()
      let todayPassHours = (nowDate - todayStartDate) / 1000 / 60 / 60
      timeLifeHour = todayPassHours
      let todayPassHoursPercent = (todayPassHours / 24) * 100
      timelife[0].num = parseInt(todayPassHours)
      timelife[0].percent = parseInt(todayPassHoursPercent) + '%'
    }
    {
      let weeks = {
        0: 7,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
      }
      let weekDay = weeks[new Date().getDay()]
      let weekDayPassPercent = (weekDay / 7) * 100
      timelife[1].num = parseInt(weekDay)
      timelife[1].percent = parseInt(weekDayPassPercent) + '%'
    }
    {
      let year = new Date().getFullYear()
      let date = new Date().getDate()
      let month = new Date().getMonth() + 1
      let monthAll = new Date(year, month, 0).getDate()
      let monthPassPercent = (date / monthAll) * 100
      timelife[2].num = date
      timelife[2].percent = parseInt(monthPassPercent) + '%'
    }
    {
      let month = new Date().getMonth() + 1
      let yearPass = (month / 12) * 100
      timelife[3].num = month
      timelife[3].percent = parseInt(yearPass) + '%'
    }
    let htmlStr = ''
    timelife.forEach((item, index) => {
      htmlStr += `
						<div class="item">
							<div class="title">
								${item.title}
								<span class="text">${item.num}</span>
								${item.endTitle}
							</div>
							<div class="progress">
								<div class="progress-bar">
									<div class="progress-bar-inner progress-bar-inner-${index}" style="width: ${item.percent}"></div>
								</div>
								<div class="progress-percentage">${item.percent}</div>
							</div>
						</div>`
    })
    $('.aside-timelife').html(htmlStr)
  },
  /* 安全链接 */
  initSecurityLink() {
    if (!DreamConfig.enable_security_link || !DreamConfig.security_link_url || DreamConfig.security_link_url.length === 0) {
      return
    }
    $(document).on('click', 'a[href]:not([data-url-security]), hyperlink-inline-card[href]:not([data-url-security]), hyperlink-card[href]:not([data-url-security])', (event) => {
      var href = $(event.currentTarget).attr('href')
      if (!href || (!href.toLowerCase().startsWith('http://') && !href.toLowerCase().startsWith('https://'))) {
        return
      }
      // 判断是否为下载链接
      const isDownloadLink = (url) => {
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.dmg', '.exe', '.msi', '.iso', '.apk']
        return downloadExtensions.some(ext => url.toLowerCase().endsWith(ext))
      }
      const isInternalLink = (url, domainList) => {
        // 将URL转换为小写并去除前导和尾随空格
        url = url.toLowerCase().trim()
        // 处理协议相对路径或绝对路径，转换为完整URL
        if (url.startsWith('//')) {
          url = window.location.protocol + url
        } else if (url.startsWith('/')) {
          url = window.location.origin + url
        }
        // 去除以http/https开头的URL的尾部斜杠
        if (url.startsWith('http://') || url.startsWith('https://')) {
          url = url.replace(/\/$/, '')
        }
        let parsedHostname
        try {
          parsedHostname = new URL(url).hostname
        } catch (e) {
          // URL解析失败，视为外部链接
          return false
        }
        // 检查是否匹配任一域名
        return domainList.some(domain => {
          if (domain.startsWith('*.')) {
            // 处理泛域名
            const mainDomain = domain.slice(2) // 移除开头的*.
            const mainParts = mainDomain.split('.')
            const hostParts = parsedHostname.split('.')
            // 检查host的尾部是否与主域名匹配，并且存在子域
            return (
              hostParts.length > mainParts.length &&
              hostParts.slice(-mainParts.length).join('.') === mainDomain
            )
          } else {
            // 处理完整域名
            return parsedHostname === domain
          }
        })
      }
      if (isDownloadLink(href)) {
        event.preventDefault()
        // 如果是下载链接，直接跳转
        window.open(href, '_blank')
      } else if (!isInternalLink(href, DreamConfig.security_link_whitelist)) {
        event.preventDefault()
        window.open((DreamConfig.security_link_url + '?target=' + encodeURIComponent(href)), '_blank')
      }
    })
  },
  /* 灰色模式 */
  initGrayMode() {
    if (DreamConfig.gray_mode === true) {
      $('html').addClass('gray-mode')
    } else if (DreamConfig.gray_mode === 'custom' && DreamConfig.gray_mode_time_list) {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const isDateInRange = (currentMonth, currentDay, timeRange) => {
        let find = false
        const [startDate, endDate] = timeRange.time.split('|').map(part => part.trim())
        if (!startDate || !endDate) {
          return find
        }
        const [startMonth, startDay] = startDate.split('/').map(part => part.trim()).map(Number)
        const [endMonth, endDay] = endDate.split('/').map(part => part.trim()).map(Number)
        if (!startMonth || !startDay || !endMonth || !endDay) {
          return find
        }
        const start = new Date(now.getFullYear(), startMonth - 1, startDay)
        const end = new Date(now.getFullYear(), endMonth - 1, endDay)
        const current = new Date(now.getFullYear(), currentMonth - 1, currentDay)
        find = current >= start && current <= end
        if (find && timeRange.desc) {
          Qmsg.info(timeRange.desc)
        }
        return find
      }

      for (const timeRange of DreamConfig.gray_mode_time_list) {
        try {
          if (isDateInRange(month, day, timeRange)) {
            $('html').addClass('gray-mode')
            break
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  },
  /* 初始化特效，只需要初始化一次，移动端设备不初始化 */
  initEffects() {
    if (Utils.isMobile()) return
    DreamConfig.cursor_move && Utils.cachedScript(`${DreamConfig.theme_base}/js/cursor/move/${DreamConfig.cursor_move}.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.cursor_click && Utils.cachedScript(`${DreamConfig.theme_base}/js/cursor/click/${DreamConfig.cursor_click}.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.enable_live2d && Utils.cachedScript(`${DreamConfig.theme_base}/js/autoload.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.effects_lantern_mode && Utils.cachedScript(`${DreamConfig.theme_base}/js/effects/lantern.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.effects_sakura_mode && Utils.cachedScript(`${DreamConfig.theme_base}/js/effects/sakura.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.effects_snowflake_mode && Utils.cachedScript(`${DreamConfig.theme_base}/js/effects/snowflake.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.effects_universe_mode && Utils.cachedScript(`${DreamConfig.theme_base}/js/effects/universe.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.effects_circle_magic_mode && Utils.cachedScript(`${DreamConfig.theme_base}/js/effects/circleMagic.min.js?mew=${DreamConfig.theme_version}`)
    DreamConfig.effects_quantum_silk_thread_mode && Utils.cachedScript(`${DreamConfig.theme_base}/js/effects/quantum.min.js?mew=${DreamConfig.theme_version}`)
  },
  /* 显示主题版本信息 */
  showThemeVersion() {
    if (!DreamConfig.enable_console_version_info) {
      return
    }
    window.logger(`%c页面加载耗时：${Math.round(performance.now())}ms | Theme By Dream2 Plus ${DreamConfig.theme_version}`,
      'color:#fff; background: linear-gradient(270deg, #986fee, #8695e6, #68b7dd, #18d7d3); padding: 8px 15px; border-radius: 0 15px 0 15px')
  },
  /* 自动滚动到内容区域 */
  autoScrollToContent() {
    const {pathname} = location
    if (pathname !== '/' && window.scrollY === 0) {
      const bannerElement = document.querySelector('.banner')
      if (bannerElement) {
        const targetTop = bannerElement.offsetHeight || 0
        window.scrollTo({
          top: targetTop,
          behavior: 'auto' // 直接滚动，不需要动画
        })
      }
    }
  },
}

window.commonContext = commonContext
let timeLifeHour = -1

!(function () {
  const loads = ['initCarousel', 'sparkInput', 'websiteTime', 'autoScrollToContent']
  const omits = ['initEffects', 'showThemeVersion', 'iniTaskItemDisabled']

  Object.keys(commonContext).forEach(
    (c) => !loads.includes(c) && !omits.includes(c) && commonContext[c]()
  )

  // 当前html加载完执行
  document.addEventListener('DOMContentLoaded', function () {
    $('html').addClass('loaded')
    loads.forEach((c) => commonContext[c] && commonContext[c]())
  })

  // 所有内容加载完执行
  window.addEventListener('load', function () {
    omits.forEach((c) => commonContext[c] && commonContext[c]())
    $('html').addClass('ready')
  })
})()
