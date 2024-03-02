FROM postgres:16.2

ARG DATABASE_PASSWORD

# Auth fix for problem connecting from inside app container
# Would need reviewing if this was serious code
#ADD pg_hba.conf /var/lib/postgresql/data/

ENV POSTGRES_PASSWORD=${DATABASE_PASSWORD}
ENV POSTGRES_HOST_AUTH_METHOD=trust

RUN echo "PW: ${POSTGRES_PASSWORD}"