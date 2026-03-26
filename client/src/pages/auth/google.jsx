import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function GoogleButton() {
  const navigate = useNavigate();
  const {setUser} = useAuth();

  const login = useGoogleLogin({
    flow:'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      console.log("TOKEN RESPONSE:", tokenResponse); 
      try {
        const res = await api.post('/auth/google', {
          access_token: tokenResponse.access_token,
        });

        // update user state
        setUser(res.data.user);
        navigate('/dashboard');
      } catch (err) {
        console.log(err);
      }
    },
    onError: () => {
      console.log('Google login failed');
    },
  });

  return (
    <button
      onClick={() => login()}
      className="w-full py-3 bg-[#1e1e1e] text-[#e0e0e0] font-semibold rounded-xl flex items-center justify-center hover:bg-[#121212] mt-3 border-2 border-gray-700"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/40px-Google_%22G%22_logo.svg.png?_=20230822192911"
        alt="Google"
        className="w-5 h-5 mr-3"
      />
      Continue with Google
    </button>
  );
}