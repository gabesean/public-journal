tinymce.init({
   selector: "#compose-content",
   plugins:
      "lists link image table code help wordcount emoticons autosave quickbars",
   autosave_interval: "5s",
   autosave_restore_when_empty: true,
   autosave_retention: "60m",
   browser_spellcheck: true,
   // skin: window.matchMedia("(prefers-color-scheme: dark)").matches
   //    ? "polaris"
   //    : "polaris",
   skin_url: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "/css/polaris"
      : "/css/polaris",
   inline: true,
   hidden_input: false,
   statusbar: true,
   menubar: false,
   toolbar:
      "styles | undo redo | bold italic underline | emoticons | alignleft aligncenter alignright alignjustify | outdent indent | link table | restoredraft",
   // toolbar_persist: true,
   toolbar_location: "top",
   fixed_toolbar_container: ".compose-toolbar-wrap",
   quickbars_insert_toolbar: false,
   setup: (editor) => {
      function editorEventCallback() {
         editor.save();
      }

      function handleEditorInit() {
         const composeForm = document.querySelector("#compose-form");

         // Remove loading animation
         composeForm.classList.remove("is-loading")
         composeForm.classList.add("is-active")
      }

      editor.on("change", editorEventCallback);
      editor.on("init", handleEditorInit);

      return (editor) => {
         // unbind event listener on teardown
         editor.off("change", editorEventCallback);
      };
   },
   init_instance_callback: (editor) => {
      editor.on("ScrollIntoView", () => {
         console.warn("scrolled");
      });

      editor.on("click", () => {
         let fixPosition = 0; // the fix
         let lastScrollY = window.scrollY; // the last scroll position
         let composeToolbar = document.querySelector(
            ".tox-tinymce-inline"
         );

         // function to set the margin to show the toolbar if hidden
         function setMargin() {
            // if toolbar wrap is hidden
            const newPosition = composeToolbar.getBoundingClientRect().top;
            if (newPosition < -1) {
               // add a margin to show the toolbar
               composeToolbar?.classList.add("down"); // add class so toolbar can be animated
               fixPosition = Math.abs(newPosition); // this is new position we need to fix the toolbar in the display
               // if at the bottom of the page take a couple of pixels off due to gap

               if (
                  window.innerHeight + window.scrollY >=
                  document.body.offsetHeight
               ) {
                  fixPosition -= 2;
                  // fixPosition += lastScrollY;
               }

               if (fixPosition > 269) {
                  fixPosition = 269;
               }
               console.log(
                  "newPosition:",
                  newPosition,
                  "fixPosition:",
                  fixPosition,
                  "DISTANCE:",
                  newPosition +
                     composeToolbar.ownerDocument.defaultView.scrollY,
                  "lastScrollY:",
                  lastScrollY
               );
               // set the margin to the new fixed position
               composeToolbar &&
                  (composeToolbar.style.marginTop = `${fixPosition}px`);
               composeToolbar && (composeToolbar.style.visibility = "visible");
            }
         }

         // function to run on scroll and blur
         function showToolbar() {
            // remove animation and put toolbar back in default position
            if (fixPosition > 0) {
               composeToolbar?.classList.remove("down");
               fixPosition = 0;
               composeToolbar && (composeToolbar.style.marginTop = `${0}px`);
            }
            // will check if toolbar needs to be fixed
            composeToolbar && (composeToolbar.style.visibility = "visible");
            setMargin();
         }

         const composeContent = document.querySelector("#compose-content");
         // add an event listener to scroll to check if
         // toolbar position has moved off the page
         window.addEventListener("scroll", showToolbar);
         // add an event listener to blur as iOS keyboard may have closed
         // and toolbar postition needs to be checked again
         composeContent.addEventListener("blur", showToolbar);
      });

      // let toolbarMutationObserver = new MutationObserver((mutations) => {
      //    mutations.forEach((mutation) => {
      //       console.warn(mutation);
      //       if (
      //          mutation.type === "attributes" &&
      //          mutation.attributeName === "style"
      //          // && mutation.oldValue === wantedValue
      //       ) {
      //          // toolbar has been hidden
      //          // remove display none to show it again

      //          mutation.target.style.display = "block";
      //       }
      //    });
      // });

      // toolbarMutationObserver.observe(
      //    document.querySelector(".tox-tinymce-inline"),
      //    {
      //       attributes: true,
      //       attributeOldValue: true,
      //    }
      // );

      // Remove event listeners on teardown
      editor.on("Remove", () => {
         window.removeEventListener("scroll", showToolbar);
         composeContent.removeEventListener("blur", showToolbar);
         // toolbarMutationObserver.disconnect();
      });
   },
   promotion: false,
});