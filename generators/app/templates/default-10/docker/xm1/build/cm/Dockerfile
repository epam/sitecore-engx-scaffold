# escape=`
ARG BASE_IMAGE
ARG MNG_SRV_IMAGE
ARG SPE_IMAGE
ARG TOOL_IMAGE

FROM ${MNG_SRV_IMAGE} as mng
FROM ${SPE_IMAGE} as spe
FROM ${TOOL_IMAGE} as tool
FROM ${BASE_IMAGE}
COPY --from=mng C:\module\cm\content C:\inetpub\wwwroot
COPY --from=spe C:\module\cm\content C:\inetpub\wwwroot
COPY --from=tool C:\tools\ C:\tools\

    