const sliderDotsCont = document.querySelector('.slider_section .control_cont .dots')
const slideTrack = document.querySelector('.slider_section .slide_track')
let slides = document.querySelectorAll('.slider_section .slide_track .slide')
const nextArrow = document.querySelector('.slider_section .control_cont .next')
const prevArrow = document.querySelector('.slider_section .control_cont .prev')
let allowActions = true
let mouseFollow = false
let currentSlide = Math.round(slides.length/2)-1
let sliderLength = slides.length
let sliderInterval
let centerSlide
let centerSlideCorrection = 0
let slideTransition = .5 //sliding transition

let autoSlideSpeed = 5 //auto sliding speed, if set as 'false' stops auto sliding


for (let i = 0; i < slides.length; i++) {
    slides[i].style.transition = `${slideTransition}s`
}


let slideWidth = parseFloat(getComputedStyle(slides[0]).width)
let slideMargin = parseFloat(getComputedStyle(slides[0]).marginLeft) + parseFloat(getComputedStyle(slides[0]).marginRight)


const updateSlides = () => {
    slides = slideTrack.querySelectorAll('.slide')
    
}

//slide clonnig functions

const cloneSlide = (index, prepend = false, before) => {
    const clone = slides[index].cloneNode(true)
    prepend ? slideTrack.prepend(clone) : before ?  slideTrack.insertBefore(clone, slides[before]) : slideTrack.appendChild(clone)
    updateSlides()
}

const initClones = () => {
    cloneSlide(slides.length - 1, true)
    cloneSlide(slides.length - 2, true)
    cloneSlide(2)
    cloneSlide(3)
}

//dots functions

const initDots = () => {
    slides.forEach((slide, i) => {
        if (i > 1 && i < slides.length - 2) {
        const dot = document.createElement('span')
        dot.setAttribute('dot-index', i - 2)
        dot.addEventListener('click', () => certainSlide(i-2))
        sliderDotsCont.appendChild(dot)
        }
    })
}

//auto update dimensions functions

const updateDimensions = () =>{
    slideWidth = parseFloat(getComputedStyle(slides[0]).width)
    slideMargin = parseFloat(getComputedStyle(slides[0]).marginLeft) + parseFloat(getComputedStyle(slides[0]).marginRight)
}

//arrows logic

nextArrow.addEventListener('click', () => nextSlide(0))
prevArrow.addEventListener('click', () => prevSlide(0))



// drag & drop logic

let startX = 0
let currentX = 0
let isDragging = false
let allowClick = true

const handleMouseDown = (e) => {
    allowClick = false
    startX = e.pageX
    isDragging = true
    slideTrack.style.transition = 'none'
}

const handleMouseMove = (e) => {
    if (!isDragging) return
    allowActions = false
    currentX = e.pageX
    const deltaX = currentX - startX
    gsap.set(slideTrack, { x: deltaX});
}

const handleMouseUp = (e) => {
    if (!isDragging) return
    isDragging = false
    const deltaX = e.pageX - startX
    
    if (Math.abs(deltaX) > slideWidth * 0.5) {
        allowActions = true
        if (deltaX < 0) {
            nextSlide(deltaX)
        } else {
            prevSlide(deltaX)
        }
    }else if(Math.abs(deltaX) < 5){
        allowClick = true
    } else {
        gsap.to(slideTrack, 
            {duration: slideTransition,
            x: 0,
            ease: "power2.out",
            onComplete: ()=> setTimeout(() => allowActions = true, slideTransition*1000)
        });
    }
}

slideTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX
    isDragging = true
})

slideTrack.addEventListener('touchmove', (e) => {
    if (!isDragging) return
    allowActions = false
    currentX = e.touches[0].pageX
    const deltaX = currentX - startX
    gsap.set(slideTrack, { x: deltaX});
})

slideTrack.addEventListener('touchend', (e) => {
    handleMouseUp({ pageX: e.changedTouches[0].pageX })
})

const handleMouseLeave = (e) => {
    if (isDragging) handleMouseUp(e)
}
slideTrack.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)
slideTrack.addEventListener('mouseleave', handleMouseLeave)




// slide click logic 

const updateSlideClickListeners = () => {    
    slides.forEach((slide, index) => {
        let clickedSlide = currentSlide + (index - ((centerSlide+centerSlideCorrection)-1))
        slide.onclick = () => {
            if (allowClick) certainSlide(clickedSlide)
        }
    })
}



// next slide function

const nextSlide = (from) =>{
    if(allowActions){
        allowActions = false
        currentSlide++
        if(currentSlide >= sliderLength){
            currentSlide = 0
        }
        gsap.fromTo(slideTrack,
            { x: from }, {
            duration: slideTransition,
            x: -slideWidth-slideMargin,
            ease: "power2.out",
            onComplete: () =>{
                gsap.to(slideTrack, {
                    duration: 0,
                    x: 0,
                    onComplete: () => {
                        cloneSlide(2)
                        slides[2].remove()
                        updateSlides()
                        cloneChange()
                        setTimeout(() => allowActions = true, slideTransition*1000);
                    }
                })
            }
        })
        centerSlideInit()
        dotChange()
        gsap.set(slideTrack, { clearProps: 'all' })
    }
}

//prev slide function 

const prevSlide = (from) =>{
    if(allowActions){
        allowActions = false
        currentSlide--
        if(currentSlide < 0){
            currentSlide = sliderLength-1
        }
    
        gsap.fromTo(slideTrack,
            { x: from }, {
            duration: slideTransition,
            x: slideWidth+slideMargin,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(slideTrack, {
                    duration: 0,
                    x: 0,
                    onComplete: () => {
                        cloneSlide(slides.length - 3, false, 2)
                        slides[slides.length - 3].remove()
                        updateSlides()
                        cloneChange()
                        setTimeout(() => allowActions = true, slideTransition*1000)
                    }
                })
            }
        })
        centerSlideInit(2)
        dotChange()
        gsap.set(slideTrack, { clearProps: 'all' });
    }
}

//active dot update function 


const dotChange = () =>{
    for (let i = 0; i < sliderDotsCont.children.length; i++) {
        sliderDotsCont.children[i].classList.remove('active')
    }
    if (sliderDotsCont.children[currentSlide]) sliderDotsCont.children[currentSlide].classList.add('active')
}

const cloneChange = () =>{
    
    slides[0].remove()
    slides[1].remove()
    slides[slides.length - 1].remove()
    slides[slides.length - 2].remove()

    updateSlides()

    cloneSlide(slides.length - 1, true)
    cloneSlide(slides.length - 2, true)
    cloneSlide(2)
    cloneSlide(3)

    updateSlides()
    updateSlideClickListeners()
    resetInterval()
}


//dot click logic 


const certainSlide = (slideTo) =>{
    if(allowActions){
        allowActions = false
        let slideGap = slideTo - currentSlide
        slideTo >= sliderLength ? currentSlide = slideTo - sliderLength  : slideTo < 0 ? currentSlide = sliderLength + (slideTo) : currentSlide = slideTo
        slideChange(slideGap)
        centerSlideInit(1)
        dotChange()
    }
}

const slideChange = (slideGap) =>{
     gsap.to(slideTrack, {
        duration: 0,
        x: (slideWidth+slideMargin)*slideGap,
        ease: "power2.out"
    })
    if (slideGap < 0) {
        for (let i = 0; i < Math.abs(slideGap); i++) {
            cloneSlide(slides.length - 3, false, 2)
            slides[slides.length - 3].remove()
            updateSlides()
            cloneChange()
        }
    }else if(slideGap > 0){
        for (let i = 0; i < Math.abs(slideGap); i++) {
            cloneSlide(2)
            slides[2].remove()
           updateSlides()
            cloneChange()
        }
    }   
    

    if (slideGap != 0)  for (let i = 0; i < slides.length; i++) slides[i].classList.remove('center_slide')

    gsap.to(slideTrack, {
        duration: slideTransition,
        x: 0,
        onComplete: ()=> setTimeout(() => allowActions = true, slideTransition*1000)
    })
}



//initiating of center slide 

const centerSlideInit = (correction = 0) =>{
    for (let i = 0; i < slides.length; i++) {
       slides[i].classList.remove('center_slide')
    }
    centerSlideCorrection = correction
    centerSlide = (Math.ceil(slides.length/2)) - correction
    slides[centerSlide].classList.add('center_slide')
    
}

//auto sliding function

const startInterval = () => {if(autoSlideSpeed){sliderInterval = setInterval(() => {allowActions ? nextSlide(0) : ''}, (slideTransition + autoSlideSpeed) * 1000)}}

const resetInterval = () =>{
    clearInterval(sliderInterval)
    startInterval()
}

window.addEventListener('resize', () => setTimeout(updateDimensions, slideTransition*1000))

startInterval()
initClones()
initDots()
updateSlideClickListeners()
nextSlide(0)
