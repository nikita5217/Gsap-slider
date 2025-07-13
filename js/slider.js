const sliderDotsCont = document.querySelector('.slider_section .control_cont .dots')
const slideTrack = document.querySelector('.slider_section .slide_track')
let slides = document.querySelectorAll('.slider_section .slide_track .slide')
const nextArrow = document.querySelector('.slider_section .control_cont .next')
const prevArrow = document.querySelector('.slider_section .control_cont .prev')
let allowActions = true
let mouseFollow = false
let currentSlide = Math.round(slides.length/2)-1
let sliderLength = slides.length

let slideTransition = .5 //sliding transition


for (let i = 0; i < slides.length; i++) {
    slides[i].style.transition = `${slideTransition}s`
    
}


let slideWidth = parseFloat(getComputedStyle(slides[0]).width)
let slideMargin = parseFloat(getComputedStyle(slides[0]).marginLeft) + parseFloat(getComputedStyle(slides[0]).marginRight)


const updateSlides = () => slides = slideTrack.querySelectorAll('.slide')

//slide clonnig functions

const cloneSlide = (index, prepend = false, before) => {
    const clone = slides[index].cloneNode(true)
    if(prepend){
        slideTrack.prepend(clone)
    }else if(before){
        slideTrack.insertBefore(clone, slides[before])
    }else{
        slideTrack.appendChild(clone)
    }
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
        dot.addEventListener('click', () => {
            allowActions = false
            certainSlide(i-2)
           
        })
        sliderDotsCont.appendChild(dot)
        }
    })
}

const updateDimensions = () =>{
    slideWidth = parseFloat(getComputedStyle(slides[0]).width)
    slideMargin = parseFloat(getComputedStyle(slides[0]).marginLeft) + parseFloat(getComputedStyle(slides[0]).marginRight)
}



nextArrow.addEventListener('click', ()=>{
    if(allowActions){
        nextSlide()
        allowActions = false
    }
})
prevArrow.addEventListener('click', ()=>{
    if(allowActions){
        prevSlide()
        allowActions = false
    }
})



//drag & drop logic

let startX = 0
let currentX = 0
let isDragging = false

const handleMouseDown = (e) => {
    startX = e.pageX
    isDragging = true
    slideTrack.style.transition = 'none'
}

const handleMouseMove = (e) => {
    if (!isDragging) return
    currentX = e.pageX
    const deltaX = currentX - startX
    slideTrack.style.transform = `translateX(${deltaX}px)`
}

const handleMouseUp = (e) => {
    if (!isDragging) return
    isDragging = false
    const deltaX = e.pageX - startX


    if (Math.abs(deltaX) > slideWidth * 0.3) {
        if (deltaX < 0) {
            nextSlide()
        } else {
            prevSlide()
        }
    } else {

        slideTrack.style.transition = `transform ${slideTransition}s ease`
        slideTrack.style.transform = 'translateX(0)'
    }
}
slideTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX
    isDragging = true
})

slideTrack.addEventListener('touchmove', (e) => {
    if (!isDragging) return
    currentX = e.touches[0].pageX
    const deltaX = currentX - startX
    slideTrack.style.transform = `translateX(${deltaX}px)`
})

slideTrack.addEventListener('touchend', (e) => {
    handleMouseUp({ pageX: e.changedTouches[0].pageX })
})

const handleMouseLeave = (e) => {
    if (isDragging) handleMouseUp(e)
}


const initDragAndDrop = () => {
    slideTrack.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    slideTrack.addEventListener('mouseleave', handleMouseLeave)
}


// next slide function

const nextSlide = () =>{
    currentSlide++
    if(currentSlide >= sliderLength){
        currentSlide = 0
    }
    
    gsap.to(slideTrack, {
        duration: slideTransition,
        x: -slideWidth-slideMargin,
        ease: "power2.out"
    })

    centerSlideInit()
    dotChange()
    gsap.set(slideTrack, { clearProps: 'all' });
    setTimeout(() => {
         gsap.to(slideTrack, {
            duration: 0,
            x: 0
        })
        
        cloneSlide(2)
        slides[2].remove()
        updateSlides()
        cloneChange()
        allowActions = true
    }, (slideTransition*1000)+10);
}

//prev slide function 

const prevSlide = () =>{
    currentSlide--
    if(currentSlide < 0){
        currentSlide = sliderLength-1
    }
    
    gsap.to(slideTrack, {
        duration: slideTransition,
        x: slideWidth+slideMargin,
        ease: "power2.out"
    })
    centerSlideInit(true)
    dotChange()
    
    gsap.set(slideTrack, { clearProps: 'all' });
    setTimeout(() => {
         gsap.to(slideTrack, {
            duration: 0,
            x: 0
        })


        cloneSlide(slides.length - 3, false, 2)

        slides[slides.length - 3].remove()

       updateSlides()

        
        cloneChange()


       
        allowActions = true
    }, (slideTransition*1000)+10);
}

const dotChange = () =>{
    const dotCount = sliderDotsCont.children.length
    for (let i = 0; i < sliderDotsCont.children.length; i++) {
        sliderDotsCont.children[i].classList.remove('active')
    }
    if (sliderDotsCont.children[currentSlide]) {
        sliderDotsCont.children[currentSlide].classList.add('active')
    }
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
}

const certainSlide = (slideTo) =>{

    let slideGap = slideTo - currentSlide

    slideChange(slideGap)


    
    currentSlide = slideTo
    setTimeout(() => centerSlideInit(false, true), 20);
    setTimeout(() => allowActions = true, (slideTransition*1000)+10);
    
    dotChange()
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
        x: 0
    })
}



//initiating of center slide 

const centerSlideInit = (prev = false, current = false) =>{
    for (let i = 0; i < slides.length; i++) {
       slides[i].classList.remove('center_slide')
    }
    prev ? slides[(Math.round(slides.length/2))-2].classList.add('center_slide'): current ? slides[(Math.round(slides.length/2))-1].classList.add('center_slide') : slides[Math.round(slides.length/2)].classList.add('center_slide')
}

window.addEventListener('resize', () => setTimeout(updateDimensions, 500))


initDragAndDrop()
initClones()
initDots()
nextSlide()
