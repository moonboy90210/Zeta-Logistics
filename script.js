// ----------NAVBAR responsive----------
let lastScrollTop = 0;

window.addEventListener("scroll", function () {
	const nav = document.querySelector("nav");
	let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

	if (currentScroll > lastScrollTop) {
		// Scrolling down
		nav.style.top = "-100px"; // Hide navbar (adjust based on your nav height)
	} else {
		// Scrolling up
		nav.style.top = "0";
	}
	lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Avoid negative scroll
});

// change nav background and font-color on scroll down
window.addEventListener("scroll", function () {
	const nav = document.querySelector(".navbar");
	if (window.scrollY > 70) {
	  nav.classList.add("scrolled");
	} else {
	  nav.classList.remove("scrolled");
	}
  });
//   -----------------------------------------

// ----------SCROLLING EFFECTS----------
const sections = document.querySelectorAll('.section'); 

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      // Remove visible class when section scrolls out
      entry.target.classList.remove('visible');
    }
  });
}, {
  threshold: 0.1
});

sections.forEach(section => {
  observer.observe(section);
}); 
// -----------------------------------------

// ----------CAROUSEL----------  
  const container = document.getElementById("scrollContainer");
    let autoScrollInterval;
	const scrollStep = 300; // Adjust if image + gap differs
  let userInteracted = false;


  // Clone child elements to create a looping effect
  function cloneScrollContent() {
    const items = Array.from(container.children);
    items.forEach(item => {
      const clone = item.cloneNode(true);
      container.appendChild(clone);
    });
  }

  function scrollByAmount(scrollStep) {
    userInteracted = true;
    container.scrollBy({ left: scrollStep, behavior: "smooth" });
  }

  function scrollLeftBtn() {
    scrollByAmount(-scrollStep);
  }

  function scrollRightBtn() {
    scrollByAmount(scrollStep);
  }
  // Auto-scroll every 4 secs
  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      if (userInteracted) {
        clearInterval(autoScrollInterval);
        return;
	  }

      // If we’re near the end, reset to the start
         const maxScrollLeft = container.scrollWidth - container.clientWidth;

      // If at or past the end, reset to start
      if (container.scrollLeft >= maxScrollLeft - scrollStep) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, 4000);
  }

  // Detect user manual interaction
    function detectUserInteraction() { 
    const stopScroll = () => userInteracted = true;
    container.addEventListener('wheel', stopScroll);
    container.addEventListener('touchstart', stopScroll);
    container.addEventListener('mousedown', stopScroll);
    document.addEventListener('keydown', stopScroll);
  }

  // Prepare looped content and start scrolling
  cloneScrollContent();
  startAutoScroll();
  detectUserInteraction();

  // Touch events for mobile
  scrollContainer.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer.addEventListener("touchend", () => {
    isDown = false;
  });

  scrollContainer.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed
    scrollContainer.scrollLeft = scrollLeft - walk;
  });


