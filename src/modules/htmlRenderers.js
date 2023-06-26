// HTML RENDER FUNCTIONS
function renderLoginLogoutButton(req) {
	let loginButton;
	let signinOrLogout;

	if (req.isAuthenticated()) {
		if (req.user.anonymous) {
			loginButton = "Logout";
			signinOrLogout = `
				<hr class="dropdown-divider">
				<div class='dropdown-item'>
					<a href='/sign-up' class='button is-fullwidth has-text-weight-semibold'>Upgrade account</a>
				</div>
				<div class='dropdown-item'>
					<button class='button is-dark is-fullwidth login-navbar-button has-text-weight-semibold js-modal-trigger' data-target='upgrade-or-delete-account-modal'>Logout</button>
				</div>
				
			`;
		} else {
			loginButton = "Logout";
			signinOrLogout = `
				<hr class="dropdown-divider">
				<form action="/logout" method="POST">
					<div class='dropdown-item'>
						<button type='submit' class='button is-dark is-fullwidth login-navbar-button has-text-weight-semibold'>Logout</button>
					</div>
				</form>
			`;
		}
	}

	return { loginButton, signinOrLogout };
}

function verifyPassForm(route) {
	const html = `<form action="/${route}" method="POST">
						<section class="modal-card-body">
							<p>You must verify your password before making any changes.</p>
							<div class="field">
								<label class="label">Current password</label>
								<div class="control">
									<input required autocomplete="password" class="input" type="password" placeholder="Your password" name="password">
								</div>
							</div>
							<button type="submit" class="button is-black is-fullwidth">Continue</button>
						</section>
					</form>`
	return html;
}

function changeUsernameForm(err) {
	const form = `<form action="/new-username" method="POST">
						<section class="modal-card-body">
							<p>Choose a username of your liking.</p>
							<div class="field">
								<label class="label">New username</label>
								<div class="control">
									<input required autocomplete="username" class="input" type="text" placeholder="Your new username" name="username">
								</div>
							</div>
							${err}
							<button type="submit" class="button is-black is-fullwidth">Change username</button>
						</section>
					</form>`
	return form;
}

function changePasswordForm(err) {
	const form = `<form action="/new-password" method="POST">
						<section class="modal-card-body">
							<p>Choose a strong password of at least 10 characters.</p>
							<p><strong>Tip:</strong> Try to use a mix of uppercase & lowercase letters, numbers, and special characters (!@#$%^&*).</p>
							<div class="field">
							<label class="label">Old password (again)</label>
								<div class="control">
									<input required autocomplete="password" class="input" type="password" placeholder="Your old password" name="oldPassword">
								</div>
							</div>
							<div class="field">
								<label class="label">New password</label>
								<div class="control">
									<input required autocomplete="password" class="input" type="password" placeholder="Your new password" name="newPassword">
								</div>
							</div>
							${err}
							<button type="submit" class="button is-black is-fullwidth">Change password</button>
						</section>
					</form>`

	return form;
}

module.exports = { renderLoginLogoutButton, verifyPassForm, changeUsernameForm, changePasswordForm };