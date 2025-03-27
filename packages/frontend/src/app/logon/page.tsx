'use client'

// React Imports
import React, { useState } from 'react';

// MUI Imports
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ToggleButton } from '@mui/material';
import Link from '@mui/material/Link';

// MUI Icons
import GoogleIcon from '@mui/icons-material/Google';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FacebookIcon from '@mui/icons-material/Facebook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';


export default function Logon() {

    const [showPassword, setShowPassword] = useState(false);
    const [selected, setSelected] = useState(false);

    return (
        <div
            className="flex justify-center items-center min-h-screen bg-lightGray"
        >
            <Container
                className='w-2/4 bg-white p-[2rem] rounded-lg shadow-md space-y-4'
            >
                {/* Titles */}
                <Box>
                    <Typography
                        className='text-h1 text-center text-primaryGreen'
                    >
                        Bem-vindo ao Agroscope!
                    </Typography>
                    <Typography
                        className='text-h2 text-center'
                    >
                        Inicie a sua sessão aqui!
                    </Typography>
                </Box>

                <Box>
                    {/* Email and Password labels */}
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        {/* Passwords */}
                        <TextField
                            label="Senha"
                            type={showPassword ?  'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Confirme sua Senha"
                            type={showPassword ?  'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                    </Box>

                    {/* Show Password */}
                    <Box
                        className='flex flex-row space-x-2'
                    >
                        <ToggleButton
                        className='flex w-9 h-9'
                        value="check"
                        selected={showPassword}
                        onChange={() => setShowPassword((prevSelected) => !prevSelected)}
                        >
                        <CheckIcon
                            className={`${showPassword ? 'text-secondaryGreen' : ''}`}
                        />
                        </ToggleButton>
                        <Typography
                            className='flex items-center'
                        >
                            Mostrar senha
                        </Typography>
                    </Box>
                </Box>

                <Box className='flex justify-center items-center'>
                    <Button
                        className="flex items-center justify-center bg-secondaryGreen hover:bg-white hover:text-black text-white rounded-lg shadow-sm w-full max-w-xs px-4 py-2 mb-6 border border-white"
                    >
                        Cadastrar-se
                    </Button>
                </Box>

                <Box>
                    <Typography 
                        className='flex justify-center'
                        variant="body1" style={{ margin: '1rem 0', color: '#757575' }}>
                        ou
                    </Typography>

                    {/* Google and Facebook Buttons */}
                    <Box
                        className='flex flex-row justify-center'
                    >
                        {/* Google Button */}
                        <Button
                            href='#'
                            className='text-mediumGray rounded-sm'
                        >
                            <GoogleIcon
                                className='h-12 w-12'
                            />
                        </Button>
                        {/* Facebook Button */}
                        <Button
                            href='#'
                            className='text-mediumGray rounded-sm'
                        >
                            <FacebookIcon
                                className='h-12 w-12'
                            />
                        </Button>
                    </Box>
                </Box>

                {/* Have Account? */}
                <Box
                    className='flex flex-col text-center'
                >

                    <Typography>
                        Já possui conta? <Link href='/login'>Fazer login <NorthEastIcon /></Link>
                    </Typography>
                </Box>
            </Container>
        </div>
    )
}