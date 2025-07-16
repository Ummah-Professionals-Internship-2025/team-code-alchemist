import './MentorSignupStyle.css';

function MentorSignupForm() {
    return (
        <>
            <div className="form-container">
                <div className="form-header">
                    <h1>Get Started</h1>
                    <p>Fill out the form below to continue</p>
                </div>

                <form id="mainForm">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea id="message" name="message" placeholder="Tell us about yourself..."></textarea>
                    </div>

                    <div className="checkbox-group">
                        <input type="checkbox" id="terms" name="terms" required/>
                        <label htmlFor="terms">I agree to the terms and conditions</label>
                    </div>

                    <button type="submit" className="submit-btn">Submit Form</button>
                </form>
            </div>
        </>
    )
}

export default MentorSignupForm;