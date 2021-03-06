import { connect } from 'react-redux';
import SessionForm from './session_form';
import { login, removeErrors } from '../../actions/session_actions';

const mSTP = (state, ownProps) => ({
    errors: state.errors.session,
    formType: 'Sign In',
});

const mDTP = (dispatch, ownProps) => ({
    removeErrors: () => dispatch(removeErrors()),
    processForm: user => dispatch(login(user)),
});

export default connect(mSTP, mDTP)(SessionForm);