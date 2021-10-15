# escape=`
ARG BASE_IMAGE
ARG TOOL_IMAGE

FROM ${TOOL_IMAGE} as tool
FROM ${BASE_IMAGE}
COPY --from=tool C:\tools\ C:\tools\
    