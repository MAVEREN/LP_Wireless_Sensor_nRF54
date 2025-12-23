# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(hub_ble_central)

target_sources(app PRIVATE
    src/main.c
    src/ble_central/scanner.c
    src/ble_central/connection_manager.c
)

target_include_directories(app PRIVATE src src/ble_central)
