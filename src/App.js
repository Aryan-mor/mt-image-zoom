import React, {useEffect, useRef} from "react";
import {FileDrop} from 'react-file-drop';
import {Box, Button, Dialog, getSafe, gLog, Tooltip, Typography, useState} from "material-ui-helper";
import './App.css';
import {cyan, grey, red} from "@material-ui/core/colors";
import {Fab, useTheme, Zoom} from "@material-ui/core";
import {Delete, ImageSearch} from "@material-ui/icons";
import Magnifier from "react-magnifier";


const ZOOM_LOCAL_KEY = "zoom-local-storage"
const SRC_LOCAL_KEY = "src-local-storage"

function App() {
    const theme = useTheme()
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState(false);
    const [zoom, setZoom] = useState(getSafe(() => {
        const z = window.localStorage.getItem(ZOOM_LOCAL_KEY);
        if (z)
            return parseInt(z)
        throw ""
    }, 1.8));
    const fileInputRef = useRef(null);
    const onFileChange = (files) => {
        gLog("onFileChange ", files)
        if (files.length !== 1) {
            if (files.length === 0)
                return;
            alert("Select one file")
            return
        }
        setFiles(files)
    }

    useEffect(() => {
        if (!files) {
            fileInputRef.current.value = ""
        }
    }, [files])

    return (
        <Box>
            <Box flexDirectionColumn={true} pt={2} pb={3} px={5} style={{zIndex: dragOver ? 0 : 100}}>
                {
                    !Boolean(files) &&
                    <Button
                        color={cyan[300]}
                        onClick={() => {
                            fileInputRef.current.click()
                        }}>
                        <Typography color={"#fff"}>
                            Select image OR Drop some files here!
                        </Typography>
                    </Button>
                }
                <Box flexDirectionColumn={true} style={{
                    position: 'fixed',
                    zIndex: 99999999,
                    right: theme.spacing(2),
                    bottom: theme.spacing(2)
                }}>
                    <ChangeZoom zoom={zoom} onChange={setZoom}/>
                    <Zoom
                        in={Boolean(files)}
                        unmountOnExit>
                        <Tooltip title={"Remove Image"}>
                            <Fab
                                onClick={() => setFiles(undefined)} style={{
                                backgroundColor: red[300],
                            }}>
                                <Delete style={{color: "#fff"}}/>
                            </Fab>
                        </Tooltip>
                    </Zoom>
                </Box>
                <input
                    ref={fileInputRef}
                    type="file"
                    id="img-input"
                    name="img"
                    accept="image/*"
                    onChange={(event) => {
                        onFileChange(event.target.files);
                    }}/>
                <Images zoom={zoom} files={files}/>
            </Box>
            <FileDrop
                onFrameDragEnter={(event) => console.log('onFrameDragEnter', event)}
                onFrameDragLeave={(event) => console.log('onFrameDragLeave', event)}
                onFrameDrop={(event) => console.log('onFrameDrop', event)}
                onDragOver={(event) => setDragOver(true)}
                onDragLeave={(event) => setDragOver(false)}
                onDrop={(files, event) => {
                    setDragOver(false)
                    onFileChange(files)
                }}>
                {
                    dragOver ?
                        "Drop some files here!" :
                        ""
                }
            </FileDrop>
        </Box>
    );
}

const sizes = ["50%", "100%", 300, 800, 1200, undefined]

function Images({files, zoom}) {
    const [src, setSrc] = useState()

    useEffect(() => {
        if (!files)
            return;
        try {
            const selectedFile = files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                setSrc(event.target.result)
            };
            reader.readAsDataURL(selectedFile);

            // const uri = URL.createObjectURL(files[0])
            // const els = document.getElementsByClassName("image")
            // for (let el of els) {
            //     el.src = uri;
            //     el.onload = function () {
            //         URL.revokeObjectURL(el.src) // free memory
            //     }
            //     console.log(el);
            // }
        } catch (e) {
        }
    }, [files])

    if (!files)
        return <React.Fragment/>

    return (
        <Box flexDirectionColumn={true}>
            {
                sizes.map(size => (
                    <Box key={size} mt={2} flexDirectionColumn={true}>
                        <Magnifier zoomFactor={zoom} src={src} width={size}/>
                        <Typography pt={0.5} variant={"h6"}>
                            {size}
                        </Typography>
                    </Box>
                ))
            }
        </Box>
    )
}


const zooms = [
    1.5,
    1.8,
    2,
    2.3,
    2.5,
    2.8,
    3.3,
    3.5,
    3.8,
    4,
    4.5,
    5,
    5.5,
    6,
    6.5,
    7,
]

function ChangeZoom({zoom, onChange}) {
    const theme = useTheme()
    const [open, setOpen] = useState(false)

    return (
        <React.Fragment>
            <Tooltip title={"Change Zoom"}>
                <Fab onClick={() => setOpen(true)}
                     style={{
                         backgroundColor: cyan[300],
                         marginTop: theme.spacing(1),
                         marginBottom: theme.spacing(1),
                     }}>
                    <Box flexDirectionColumn={true} style={{color: "#fff"}}>
                        <ImageSearch style={{color: "#fff"}}/>
                        {zoom}
                    </Box>
                </Fab>
            </Tooltip>
            <Dialog maxWidth={"md"} open={open} onClose={() => setOpen(false)}>
                <Box width={1} flexWrap={"wrap"}>
                    <Box width={1} py={2} px={1}>
                        <Typography variant={"h5"}>
                            Change zoom:
                        </Typography>
                    </Box>
                    {
                        zooms.map(it => {
                            const active = zoom === it
                            return (
                                <Box p={1} key={it}>
                                    <Button variant={active ? undefined : "outlined"}
                                            color={active ? cyan[400] : grey[500]}
                                            onClick={() => {
                                                setOpen(false)
                                                onChange(it)
                                                window.localStorage.setItem(ZOOM_LOCAL_KEY, it.toString());
                                            }}>
                                        <Typography variant={"h6"} color={active ? "#fff" : "#000"}>
                                            {it}
                                        </Typography>
                                    </Button>
                                </Box>
                            )
                        })
                    }
                </Box>
            </Dialog>
        </React.Fragment>
    )
}


export default App;
