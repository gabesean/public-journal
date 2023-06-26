// Globals
const url = window.location.href;
const baseUrl = window.location.origin;
const wrapper = document.querySelector("#wrapper");
const navbar = document.querySelector(".navbar");

// Forms
const allForms = document.querySelectorAll("form[method=POST]") // All forms of method POST
const allSubmitButtons = document.querySelectorAll("button[type=submit]") // ALL submit type buttons
const signUpForm = document.querySelector("#sign-up-form");
const signUpButton = document.querySelector(".sign-up-button");
const signInForm = document.querySelector("#sign-in-form");
const signInButton = document.querySelector(".sign-in-button");

const composeForm = document.querySelector('#compose-form');
const composeTitle = document.querySelector('#compose-title');
const composeContent = document.querySelector('#compose-content');
const composeSubmit = document.querySelector('#submit-button');
const composeToolbarWrap = document.querySelector(".compose-toolbar-wrap");


const deleteForm = document.querySelector('#delete-form');
const deleteButton = document.querySelector('.delete-button');
const showCommentFormButton = document.querySelector('#show-comment-form');
const addCommentForm = document.querySelector('#add-comment-form');
const addCommentTextarea = document.querySelector('#add-comment-textarea');
const addCommentButton = document.querySelector('#add-comment-button');
const showEditCommentFormButton = document.querySelectorAll('.edit-button');
const editCommentForm = document.querySelectorAll('.edit-comment-form');
const editCommentTextarea = document.querySelector('.edit-comment-textarea');
// const updateCommentButton = document.querySelector('.update-comment-button');
const editCommentBody = document.querySelector('.comment-body');
const deleteCommentForm = document.querySelectorAll('.delete-comment-form');
const footer = document.querySelector(".footer");

const loginNavbarButton = document.querySelector(".login-navbar-button");
const continueToLogoutButton = document.querySelector("#continue-to-logout");

const userExists = document.querySelector('.username-taken');
const usernameInput = document.querySelector('.username-input');
const usernameTakenHelp = document.querySelector('.username-taken');
const passwordInput = document.querySelector('.password-input');
const signInHelp = document.querySelector('.sign-in-help');

// Progress Bar
const progressBars = document.querySelectorAll('.progress');

// Notifications
const timedNotificationSection = document.querySelector('.timed-notification-section');

document.addEventListener('input', (e) => {
	if (usernameTakenHelp) {
		usernameTakenHelp.classList.add("is-hidden");
	}
	if (signInHelp) {
		signInHelp.classList.add("is-hidden");
	}
});











document.addEventListener('DOMContentLoaded', () => {
   // ~~~~~~~~~~ SORT ENTRIES ~~~~~~~~~~ //
   const sortEntriesSelect = document.querySelector('#sort-entries');

   sortEntriesSelect?.addEventListener("change", handleSortEntries);

   sortEntriesSelect ? handleSortEntries() : null;

   function handleSortEntries(event) {
      const urlQueries = new URLSearchParams(window.location.search);
      const sortQuery = urlQueries.get('sort');

      // handle event if from an event listener
      if (event) {
         const sortValue = event.target.value;

         document.querySelector('#sort-entries').querySelector(`option[value=${sortValue}]`).selected = true;

         if (sortValue !== "newest") {
            urlQueries.set("sort", sortValue);
            window.location.replace(`?${urlQueries.toString()}`)
         } else {

            // `window.location.pathname` returns the current route without queries so this function is portable
            window.location.replace(window.location.pathname)
         }
      }
      
      // handle url queries if they are present
      if (sortQuery) {
         sortEntriesSelect.querySelector(`option[value=${sortQuery}]`).selected = true;
      } else {
         sortEntriesSelect.querySelector(`option[value=newest]`).selected = true;
      }
   }
   

   // ~~~~~~~~~~ VERIFY PASSWORD ROUTE ~~~~~~~~~~ //
   const verifyPasswordForm = document.querySelector("[action='/verify-password']");

   // When clicking on `.change-username-button` make sure the route directs to change username
   const changeUsernameButton = document.querySelector(".change-username-button");

   changeUsernameButton?.addEventListener("click", () => {
      const reasonHiddenInput = Object.assign(document.createElement("input"), {
         type: "hidden",
         name: "reason",
         value: "change-username"
      });

      verifyPasswordForm.append(reasonHiddenInput);
   })

   // When clicking on `.change-password-button` make sure the route directs to change password
   const changePasswordButton = document.querySelector(".change-password-button");

   // ~~~~~~~~~~ LOGOUT ROUTE ~~~~~~~~~~ //
   continueToLogoutButton?.addEventListener("click", () => {
      if (window.location.href.includes("/settings")) {
         // If we are already on the settings page

         // Close the currently open modal, or all modals too I guess...
         closeAllModals();

         // Click on `Delete account` button to bring up final modal in this process
         document
            .querySelector("button[data-target=delete-account-modal]")
            .click();
      } else {
         // Take user to settings page with a hash signal to open the `Delete account` modal
         window.location.href =
            "/settings#continue-to-logout-and-delete-my-data";
      }
   });

   if (window.location.hash === "#continue-to-logout-and-delete-my-data") {
      document
         .querySelector(".delete-account-modal")
         ?.classList.add("is-active");
   }

   // ~~~~~~~~~~ COMPOSE ROUTE ~~~~~~~~~~ //
   composeForm
      ?.querySelector("#submit-button")
      .addEventListener("click", (event) => {
         // Copy contents from contenteditable title field to hidden input for postTitle
         composeForm.querySelector("input[name=postTitle]").value =
            composeForm.querySelector("#compose-title").innerText;
         // Copy contents from contenteditable content field to hidden input for postArea
         composeForm.querySelector("input[name=postArea]").value =
            composeForm.querySelector("#compose-content").innerHTML;
      });

   

   document.querySelectorAll("[contenteditable=true][data-max-length]")?.forEach((editableEl) => {
      // Run once since you could be editing an entry with a title already
      handleTextLength();

      // Add event listeners
      editableEl.addEventListener("input", handleTextLength);
      editableEl.addEventListener("keydown", handleTextLength);
      editableEl.addEventListener("paste", handleTextLength);

      function handleTextLength(event) {
         let allowedKeys = false;

         const maxLength = parseInt(editableEl.dataset.maxLength);
         const valueLength = editableEl.innerText.length;
         

         if (event?.type === "keydown") {
            allowedKeys =
               event.which === 8 /* BACKSPACE */ ||
               event.which === 35 /* END */ ||
               event.which === 36 /* HOME */ ||
               event.which === 37 /* LEFT */ ||
               event.which === 38 /* UP */ ||
               event.which === 39 /* RIGHT*/ ||
               event.which === 40 /* DOWN */ ||
               event.which === 46 /* DEL*/ ||
               ((event.metaKey || event.ctrlKey) && event.which === 65) /* CTRL/CMD + A */ ||
               ((event.metaKey || event.ctrlKey) && event.which === 88) /* CTRL/CMD + X */ ||
               ((event.metaKey || event.ctrlKey) && event.which === 67) /* CTRL/CMD + C */ ||
               ((event.metaKey || event.ctrlKey) && event.which === 86) /* CTRL/CMD + V */ ||
               ((event.metaKey || event.ctrlKey) && event.which === 90) /* CTRL/CMD + Z */ ||
               ((event.metaKey || event.ctrlKey) && event.which === 70) /* CTRL/CMD + F */ ||
               ((event.metaKey || event.ctrlKey) && event.which === 82) /* CTRL/CMD + R */;
         }

         if (event?.type === "paste") {
            
            setTimeout(() => {

               // Get the range of the selection
               const selection = window.getSelection();
               const range = selection.getRangeAt(0);

               // Get the pasted content
               const pastedContent = event.clipboardData.getData("text/plain");

               // Insert the pasted content at the current cursor position
               const existingText = range.toString();
               const newText =
                  existingText.slice(0, range.startOffset) +
                  pastedContent +
                  existingText.slice(range.endOffset);
               range.deleteContents();
               range.insertNode(document.createTextNode(newText));

               // Update the selection
               selection.removeAllRanges();
               selection.addRange(range);
               // Update the value of the span
               // event.target.innerText = event.target.innerText.slice(0, maxLength);
            });
         }

         const textLengthTag = editableEl.closest(".entry-title").querySelector(".text-length-tag");
         const textLength = textLengthTag.querySelector(".text-length");
         const textLengthIcon = textLengthTag.querySelector(".text-length-icon");

         

         // Check if the length of the value exceeds or is below the maximum length
         if (valueLength > maxLength) {
            if (!allowedKeys && valueLength >= (maxLength * 2)) {
               event.preventDefault();
            } 
            
            // Update character length counter anyway
            const surplusAmount = valueLength - maxLength;
            const suffix = surplusAmount === 1 ? "" : "s";

            textLengthTag.classList.add("is-active");
            textLengthIcon.textContent = "⚠️";
            textLength.textContent = `Text is too long by ${surplusAmount} character${suffix}`;
            
         } else if (valueLength >= (maxLength / 2)) {
            const charactersLeft = maxLength - valueLength;
            const suffix = charactersLeft === 1 ? "" : "s";
            
            textLengthTag.classList.add("is-active");
            textLengthIcon.textContent = "ℹ️";
            textLength.textContent = `${charactersLeft} character${suffix} left`;
         } else if (valueLength < (maxLength / 2)) {

            textLengthTag.classList.remove("is-active");
         }
      }
   })

   // Clear website message when `x` button is clicked
   document.querySelectorAll(".notification-timed .delete, .notification-regular .delete")?.forEach((closeButton) => {
      const parentNotification = closeButton.closest(".notification-timed, .notification-regular");
      closeButton.addEventListener("click", () => {
         
         // `.notification-timed` recieves a 'heavier' animation effect
         if (parentNotification.classList.contains("notification-timed")) {
            animateClearNotification(parentNotification, "heavy");
         } else {
            animateClearNotification(parentNotification, "light");
         }
      });
   });

   // Add animation to `.notification-timed` progress bar for website messages
   progressBars?.forEach((bar, i) => {
      // Ofset each notification animation if there are multiple to create a smooth rubber banding type effect
      const animationOffset = i * 1000;

      animateProgressBar(bar, 5, animationOffset);
   });

   function animateProgressBar(
      node,
      animationLengthInSeconds,
      animationOffset
   ) {
      // Calculate interval by converting sec to ms and dividing by number of total stops on progress bar
      const interval = (animationLengthInSeconds * 1000) / 200;
      const parentNotification = node.parentElement;

      const animationInterval = setInterval(() => {
         // Progress bar is 0 - 100
         // Since we want each stop to be 0.5, that makes 100 / 0.5 so this function will be executed 200x
         node.value = node.value - 0.5;

         // Do this once progress bar value goes to 0.
         if (node.value === 0) {
            clearInterval(animationInterval);

            setTimeout(() => {
               animateClearNotification(parentNotification, "heavy");
            }, 2000 - animationOffset);
         }
      }, interval);
   }

   function animateClearNotification(node, animationStrength) {

      if (!animationStrength) {
         console.error("Please provide an animation strength argument. Like 'light' or 'heavy'.")
         return;
      }

      if (animationStrength === "light") {
         node.classList.remove("animate-glideIn--reduced");
         node.classList.add("animate-glideOut--reduced");
      } else if (animationStrength === "heavy") {
         node.classList.remove("animate-glideIn");
         node.classList.add("animate-glideOut");
      } else {
         console.error("Please provide a valid animation strength argument. Only 'light' or 'heavy' are valid.");
         return;
      }
      
      node.classList.add("mt-0");

      setTimeout(() => {
         node.remove();

         // Remove the `timedNotificationSection` after all notifications are cleared
         removeTimedNotificationSection();
      }, 1000);
   }

   function removeTimedNotificationSection() {
      // If there are no `.progress` bars (!length) assume there are no more notifications left to display on the DOM
      if (!document.querySelectorAll(".progress").length) {
         timedNotificationSection.remove();
      }
   }

   // Add button submit 'is-loading' animation to all submit type buttons
   allForms.forEach((form) => {
      // Always focus first input

      form.addEventListener("formdata", handleFormSubmit);
   });

   // Handler function for all forms
   function handleFormSubmit(event) {
      const submitButton = event.target.querySelector("button[type=submit]");

      // Trigger loading animation
      addLoadingAnimation(submitButton);

      // Disable all form inputs
      disableRelevantInputFields(event.target);
   }

   // Function to focus the first input element always (includes textarea and contenteditable divs)

   // Function to add a loading animation to an element w/Bulma CSS
   function addLoadingAnimation(DOMElement) {
      DOMElement.classList.add("is-loading");
      DOMElement.disabled = true;
   }

   // Function to disable all the input fields of a form when pressing the submit button
   function disableRelevantInputFields(DOMElement) {
      const inputFields = DOMElement.querySelectorAll("input");
      const textareaFields = DOMElement.querySelectorAll("textarea");

      // Disable each input field
      inputFields.forEach((input) => {
         input.disabled = true;
      });

      // Disable each input field
      textareaFields.forEach((textarea) => {
         textarea.disabled = true;
      });
   }

   // Functions to open and close a modal
   function openModal($el) {
      $el.classList.add("is-active");
   }

   function closeModal($el) {

      // Remove all hidden inputs with `reason` attribute to reset the intended reason for specific modals
      $el.querySelectorAll("input[name=reason][type=hidden]").forEach((hiddenInput) => {
         hiddenInput.remove();
      });

      $el.classList.remove("is-active");
   }

   function closeAllModals() {
      (document.querySelectorAll(".modal") || []).forEach(($modal) => {
         closeModal($modal);
      });
   }

   // Add a click event on buttons to open a specific modal
   (document.querySelectorAll(".js-modal-trigger") || []).forEach(($trigger) => {
      const modal = $trigger.dataset.target;
      const $target = document.getElementById(modal);

      $trigger.addEventListener("click", () => {
         openModal($target);
      });
   });

   // Add a click event on various child elements to close the parent modal
   (document.querySelectorAll(".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button") || []).forEach(($close) => {
      const $target = $close.closest(".modal");

      $close.addEventListener("click", () => {
         closeModal($target);
      });
   });

   // Add a keyboard event to close all modals
   document.addEventListener("keydown", (event) => {
      const e = event || window.event; // compatibility for some older browsers

      if (e.keyCode === 27) {
         // Escape key
         closeAllModals();
      }
   });
});


// Show Add Comment Form
showCommentFormButton?.addEventListener("click", () => {
	addCommentForm.classList.toggle("is-hidden");
	if (showCommentFormButton.innerText.includes("Add a comment")) {
		showCommentFormButton.innerText = "Hide comment area";
		Object.assign(showCommentFormButton.style, {
			backgroundColor: "unset",
			fontWeight: "bold",
			color: "black",
			padding: 0
		});
		addCommentTextarea.focus();
	} else {
		showCommentFormButton.innerText = "Add a comment";
		Object.assign(showCommentFormButton.style, {
			backgroundColor: "black",
			fontWeight: "bold",
			color: "white",
			paddingTop: "calc(.5em - 1px)",
			paddingRight: "1em",
			paddingBottom: "calc(.5em - 1px)",
			paddingLeft: "1em",
		});
		addCommentTextarea.blur();
	}
});

// Show Edit Comment Form
showEditCommentFormButton?.forEach((showEdit) => {
	showEdit.addEventListener("click", handleClick);

   function handleClick(event) {
      const editCommentButton = this;

      const editCommentForm = editCommentButton.closest(".comment-container").querySelector(".edit-comment-form");
      // const editCommentTextarea = editCommentForm.closest(".edit-comment-textarea");

      editCommentForm.classList.toggle("is-hidden");
      editCommentForm.nextElementSibling.classList.toggle("is-hidden");

      const cancelText = Object.assign(document.createElement("span"), {
         className: "cancel-text",
         textContent: "Cancel"
      });
      
      const buttonIcon = editCommentButton.querySelector(".icon");

      if (!editCommentButton.innerText.includes("Cancel")) {
         buttonIcon.classList.add("is-hidden");
         editCommentButton.append(cancelText);

         Object.assign(editCommentButton.style, {
            fontWeight: "bold",
         });
      } else {
         buttonIcon.classList.remove("is-hidden");
         editCommentButton.querySelector(".cancel-text").remove();
      }
   }
})


// 	document.onreadystatechange = () => {
// 		if (document.readyState !== "complete") {
// 			navbar.classList.add("is-hidden");
// 			wrapper.classList.add("is-hidden");
// 			footer.classList.add("is-hidden");
// 			loader.classList.remove("is-hidden");
// 			loader.style.display = "flex";
// 		} else {
// 			setTimeout(() => {
// 
// 				loader.style.display = "none";
// 				loader.classList.add("is-hidden");
// 				wrapper.classList.remove("is-hidden");
// 				footer.classList.remove("is-hidden");
// 			}, 500)
// 		}
// 	};
	
		
// 		navbar.classList.remove("is-hidden");
// 		setTimeout(() => {
// 
// 			loader.style.display = "none";
// 			loader.classList.add("is-hidden");
// 			wrapper.classList.remove("is-hidden");
// 			footer.classList.remove("is-hidden");
// 			
// 		}, 500)


// Navbar
document.addEventListener('DOMContentLoaded', () => {
	// Get siteLogo
	const siteLogo = document.querySelector(".site-logo");

   // Get all "navbar-burger" elements
   const $navbarBurgers = Array.prototype.slice.call(
      document.querySelectorAll(".navbar-burger"),
      0
   );

   // Add a click event on each of them
   $navbarBurgers.forEach((el) => {
      el.addEventListener("click", () => {
         // Get the target from the "data-target" attribute
         const target = el.dataset.target;
         const $target = document.getElementById(target);

         // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu" and accessibility
			setAriaExpanded(el, "toggle")
         
         if (!el.classList.contains("is-active")) {
            closeOpenMenus([el, $target]);
         }
         
         el.classList.toggle("is-active");
         $target.classList.toggle("is-active");

			// Toggle a class that shows the logo in the burger menu only on mobile
			if (window.innerWidth <= '768') {
				siteLogo.classList.toggle("site-logo__active");
			}
			
      });
   });

	window.addEventListener("resize", (event) => {
		if (window.innerWidth >= '769') {
			siteLogo.classList.remove("site-logo__active");
		} else {
			if ($navbarBurgers[0].classList.contains("is-active")) {
            siteLogo.classList.add("site-logo__active");
         }
			
		}
	})

   // Navbar account menu
   const accountMenu = document.querySelector(".account-menu");
   const accountMenuButton = document.querySelector(
      ".account-menu .menu-trigger"
   );

   accountMenuButton?.addEventListener("click", (event) => {
		closeOpenMenus(event.currentTarget.parentElement);
		setAriaExpanded(accountMenuButton, "toggle")
      accountMenu.classList.toggle("is-active");
   });

   // Exit navbar menu if clicked outside the menu
   const burger = document.querySelector("#burger");
   const navbarToggle = document.querySelector("#navbarToggle");

   document.addEventListener("click", (event) => {
      if (
         !event.target.closest("#burger") &&
         !event.target.closest("#navbarToggle") &&
         !event.target.closest(".account-menu")
      ) {
         setAriaExpanded([accountMenuButton, burger], "false");

         // Close ALL open menus
         closeOpenMenus();

			siteLogo.classList.remove("site-logo__active");
      }
   });
});

// Function to close everything with a class presence of 'is-active'
function closeOpenMenus(menuToBeLeftOpened) {

   if (menuToBeLeftOpened) {
      // If argument is provided, close all menus except the one provided in the argument
      const menusToBeClosed = Array.from(
         document.querySelectorAll(".navbar-burger.is-active, .navbar-menu.is-active, .account-menu.is-active")
      ).filter((el) => {

         if (menuToBeLeftOpened.length) {
            
            return menuToBeLeftOpened.filter((menu) => {
               return el !== menu;
            })
         } else {   
            return el !== menuToBeLeftOpened;
         }
         
      });

      menusToBeClosed.forEach((menu) => {
         menu.classList.remove("is-active");
      });
   } else {
      // Close every open menu
      document
         .querySelectorAll(
            ".navbar-burger.is-active, .navbar-menu.is-active, .account-menu.is-active"
         )
         .forEach((menu) => {
            menu.classList.remove("is-active");
         });
   }

   if (window.innerWidth <= "768") {
      document
         .querySelector(".site-logo")
         ?.classList.remove("site-logo__active");
   }
}







// SCRIPTS THAT DEAL WITH LOCALSTORAGE
if (storageAvailable("localStorage")) {

   // Regular Notification Elements
   document.addEventListener("DOMContentLoaded", () => {
      (document.querySelectorAll(".notification-regular .delete") || []).forEach(($delete) => {
         const $notification = $delete.parentNode;
         const { name } = $notification.dataset;
         const showNotice = localStorage.getItem(name);

         if (!showNotice || showNotice !== "false") {
            $notification.classList.remove("is-hidden");
			}

         $delete.addEventListener("click", () => {
            // $notification.parentNode.removeChild($notification);
            localStorage.setItem(name, "false");
         });
		});
   });
}

//~~~~~~~~~~~~~~~~ FUNCTIONS ~~~~~~~~~~~~~~~~//

// MDN function to check if localStorage is available
function storageAvailable(type) {
   let storage;
   try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
   } catch (e) {
      return (
         e instanceof DOMException &&
         // everything except Firefox
         (e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === "QuotaExceededError" ||
            // Firefox
            e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
         // acknowledge QuotaExceededError only if there's something already stored
         storage &&
         storage.length !== 0
      );
   }
}

// Accessibility
function setAriaExpanded(DOMElement, mode) {

	if (DOMElement) {
		if (mode === "toggle") {
         if (DOMElement.constructor.toString().includes("Array")) {
            DOMElement.forEach((el) => {
               if (el) {
                  el.ariaExpanded === "true"
                     ? (el.ariaExpanded = "false")
                     : (el.ariaExpanded = "true");
               }
               
            });
         } else {
            DOMElement.ariaExpanded === "true"
               ? (DOMElement.ariaExpanded = "false")
               : (DOMElement.ariaExpanded = "true");
         }
         
      } else {
         if (DOMElement.constructor.toString().includes("Array")) {
            DOMElement.forEach((el) => {
               if (el) {
                  el.ariaExpanded = mode;
               }
            });
         } else {
            DOMElement.ariaExpanded = mode;
         }
      }
	}
}
