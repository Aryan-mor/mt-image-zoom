import React, {useEffect, useRef} from "react";
import {FileDrop} from 'react-file-drop';
import {Box, Button, Dialog, getSafe, gLog, Tooltip, Typography, useState} from "material-ui-helper";
import './App.css';
import {cyan, grey, red, orange, teal} from "@material-ui/core/colors";
import {Fab, useTheme, Zoom} from "@material-ui/core";
import {Delete, ImageSearch, Search, RadioButtonUnchecked, CheckBoxOutlineBlank} from "@material-ui/icons";
import Magnifier from "react-magnifier";

const ZOOM_LOCAL_KEY = "zoom-local-storage"
const MG_ZOOM_LOCAL_KEY = "mg-zoom-local-storage"
const MG_SHAPE_LOCAL_KEY = "mg-shape-local-storage"

function App() {
    const theme = useTheme()
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState(false);
    const [zoom, setZoom] = useState(getSafe(() => {
        const z = window.localStorage.getItem(ZOOM_LOCAL_KEY);
        if (z)
            return parseFloat(z)
        throw ""
    }, 1.8));
    const [mgZoom, setMgZoom] = useState(getSafe(() => {
        const z = window.localStorage.getItem(MG_ZOOM_LOCAL_KEY);
        if (z)
            return parseFloat(z)
        throw ""
    }, 150));
    const [mgShape, setMgShape] = useState(getSafe(() => {
        const shape = window.localStorage.getItem(MG_SHAPE_LOCAL_KEY);
        if (shape)
            return shape
        throw ""
    }, "circle"));
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

                    <Tooltip title={`Cahnge shape to ${mgShape === "circle" ? "square" : "circle"}`}>
                        <Fab
                            onClick={() => {
                                const newShape = mgShape === "circle" ? "square" : "circle"
                                setMgShape(newShape)
                                window.localStorage.setItem(MG_SHAPE_LOCAL_KEY, newShape);
                            }} style={{
                            backgroundColor: teal[300],
                        }}>
                            {
                                mgShape !== "circle" ?
                                    <RadioButtonUnchecked style={{color: "#fff"}}/>
                                    : <CheckBoxOutlineBlank style={{color: "#fff"}}/>
                            }
                        </Fab>
                    </Tooltip>
                    <ChangeMgZoom mgZoom={mgZoom} onChange={setMgZoom}/>
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
                <Images zoom={zoom} mgZoom={mgZoom} mgShape={mgShape} files={files}/>
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

function Images({files, mgZoom, mgShape, zoom}) {
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
                        <Magnifier
                            className={`glass-${mgShape}`}
                            mgWidth={mgZoom < mgZooms[0] ? mgZooms[0] : mgZoom}
                            mgHeight={mgZoom < mgZooms[0] ? mgZooms[0] : mgZoom}
                            mgShape={mgShape}
                            zoomFactor={zoom < zooms[0] ? zooms[0] : zoom}
                            src={src} width={size}/>
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
    0.1,
    0.3,
    0.5,
    0.7,
    0.8,
    1,
    1.1,
    1.2,
    1.3,
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

const mgZooms = [
    50,
    100,
    150,
    200,
    250,
    300,
    350,
    400,
    450,
    500,
]

function ChangeMgZoom({mgZoom, onChange}) {
    const theme = useTheme()
    const [open, setOpen] = useState(false)

    return (
        <React.Fragment>
            <Tooltip title={"Change Magnifying Zoom"}>
                <Fab onClick={() => setOpen(true)}
                     style={{
                         backgroundColor: orange[300],
                         marginTop: theme.spacing(1),
                         marginBottom: theme.spacing(1),
                     }}>
                    <Box flexDirectionColumn={true} style={{color: "#fff"}}>
                        <Search style={{color: "#fff"}}/>
                        {mgZoom}
                    </Box>
                </Fab>
            </Tooltip>
            <Dialog maxWidth={"md"} open={open} onBackdropClick={() => setOpen(false)}>
                <Box width={1} flexWrap={"wrap"}>
                    <Box width={1} py={2} px={1}>
                        <Typography variant={"h5"}>
                            Change zoom:
                        </Typography>
                    </Box>
                    {
                        mgZooms.map(it => {
                            const active = mgZoom === it
                            return (
                                <Box p={1} key={it}>
                                    <Button variant={active ? undefined : "outlined"}
                                            color={active ? cyan[400] : grey[500]}
                                            onClick={() => {
                                                setOpen(false)
                                                onChange(it)
                                                window.localStorage.setItem(MG_ZOOM_LOCAL_KEY, it.toString());
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
