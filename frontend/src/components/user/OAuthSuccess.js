import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from '../../actions/userActions';
import Loader from '../Layout/Loader';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // We could extract the token from query string if needed:
    // const params = new URLSearchParams(location.search);
    // const token = params.get('token');
    
    // But since the backend sets an httpOnly cookie, 
    // loadUser() should be able to fetch the user profile.
    dispatch(loadUser()).then(() => {
        navigate('/');
    }).catch(() => {
        navigate('/');
    });
  }, [dispatch, navigate, location]);

  return <Loader />;
};

export default OAuthSuccess;
