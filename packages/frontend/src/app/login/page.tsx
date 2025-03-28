"use client";

// React Imports
import React, { useState } from "react";

// MUI Imports
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

// MUI Icons
import GoogleIcon from "@mui/icons-material/Google";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import FacebookIcon from "@mui/icons-material/Facebook";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-lightGray">
      <Container className="w-2/4 bg-white p-[2rem] rounded-lg shadow-md space-y-4">
        {/* Titles */}
        <Box>
          <Typography className="text-h1 text-center text-primaryGreen">
            Bem-vindo ao Agroscope!
          </Typography>
          <Typography className="text-h2 text-center">
            Inicie a sua sessão aqui!
          </Typography>
        </Box>

        {/* Email and Password labels */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Senha"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  className="min-w-0 p-2"
                >
                  <VisibilityIcon
                    className={`${
                      showPassword
                        ? "text-secondaryGreen"
                        : "text-mediumGray text-opacity-50"
                    }`}
                  />
                </Button>
              ),
            }}
          />
          <Button className="flex items-center justify-center bg-secondaryGreen hover:bg-white hover:text-black text-white rounded-lg shadow-sm w-full max-w-xs px-4 py-2 mb-6 border border-white">
            Login
          </Button>

          <Typography
            variant="body1"
            style={{ margin: "1rem 0", color: "#757575" }}
          >
            ou
          </Typography>
        </Box>

        {/* Google and Facebook Buttons */}
        <Box className="flex flex-row justify-center">
          {/* Google Button */}
          <Button href="#" className="text-mediumGray rounded-sm">
            <GoogleIcon className="h-12 w-12" />
          </Button>
          {/* Facebook Button */}
          <Button href="#" className="text-mediumGray rounded-sm">
            <FacebookIcon className="h-12 w-12" />
          </Button>
        </Box>

        {/* Forget password and create account */}
        <Box className="flex flex-col text-center">
          <Link href="#">
            Esqueceu a senha? <NorthEastIcon />
          </Link>

          <Typography>
            Não está cadastrado?{" "}
            <Link href="/logon">
              Cadastre-se aqui! <NorthEastIcon />
            </Link>
          </Typography>
        </Box>
      </Container>
    </div>
  );
}
