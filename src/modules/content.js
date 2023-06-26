exports.content = () => {
	const homeStartingContent = "Anyone can write what they wish on here.";
	
	const aboutContent = {
      cta1: {
         title: "Welcome to the Public Journal",
         subtitle:
            "The modern and easy to use online journal where anyone can freely write on it.",
      },
      cta2: {
         icon: "📢",
         title: "Engage with the public",
         subtitle: "Create journal entries, comment on them, and more!",
      },
   };
	
	const discardTime = "Entries will be discarded after six hours to keep it fresh";
	
	const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
	
	return { homeHeading: homeStartingContent, aboutContent, timeToDiscard: discardTime, contactInfo: contactContent }
}